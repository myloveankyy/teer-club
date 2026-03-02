const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

const WITHDRAWAL_THRESHOLD = 2500;

// @route   GET /api/finance/bank-accounts
// @desc    Get user's bank accounts
router.get('/bank-accounts', verifyToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM bank_accounts WHERE user_id = $1 ORDER BY is_primary DESC, created_at DESC',
            [req.user.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Fetch bank accounts error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/finance/bank-accounts
// @desc    Add a new bank account
router.post('/bank-accounts', verifyToken, async (req, res) => {
    const { account_holder_name, bank_name, account_number, ifsc_code } = req.body;
    try {
        // Check if primary needs to be set
        const countRes = await db.query('SELECT COUNT(*) FROM bank_accounts WHERE user_id = $1', [req.user.id]);
        const isPrimary = parseInt(countRes.rows[0].count) === 0;

        const result = await db.query(
            'INSERT INTO bank_accounts (user_id, account_holder_name, bank_name, account_number, ifsc_code, is_primary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, account_holder_name, bank_name, account_number, ifsc_code, isPrimary]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Add bank account error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/finance/bank-accounts/:id/primary
// @desc    Set a bank account as primary
router.put('/bank-accounts/:id/primary', verifyToken, async (req, res) => {
    try {
        await db.query('BEGIN');
        await db.query('UPDATE bank_accounts SET is_primary = FALSE WHERE user_id = $1', [req.user.id]);
        await db.query('UPDATE bank_accounts SET is_primary = TRUE WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        await db.query('COMMIT');
        res.json({ success: true, message: 'Primary account updated' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Set primary account error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/finance/withdraw
// @desc    Request a withdrawal
router.post('/withdraw', verifyToken, async (req, res) => {
    const { amount, bank_account_id } = req.body;
    const client = await db.connect();
    try {
        if (!amount || parseFloat(amount) < WITHDRAWAL_THRESHOLD) {
            client.release();
            return res.status(400).json({ success: false, error: `Minimum withdrawal amount is ₹${WITHDRAWAL_THRESHOLD}` });
        }

        await client.query('BEGIN');

        const userRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
        if (!userRes.rows[0] || parseFloat(userRes.rows[0].wallet_balance) < parseFloat(amount)) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
        }

        // Deduct from wallet immediately (held pending approval)
        await client.query(
            'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2',
            [parseFloat(amount), req.user.id]
        );

        // Create withdrawal request record
        const wrRes = await client.query(
            `INSERT INTO withdrawal_requests (user_id, bank_account_id, amount, status)
             VALUES ($1, $2, $3, 'PENDING') RETURNING id`,
            [req.user.id, bank_account_id || null, parseFloat(amount)]
        );
        const withdrawalId = wrRes.rows[0].id;

        // Record in transaction ledger
        await client.query(
            `INSERT INTO transactions (user_id, amount, type, status, description)
             VALUES ($1, $2, 'WITHDRAWAL', 'PENDING', $3)`,
            [req.user.id, parseFloat(amount), `Withdrawal request #${withdrawalId} — Pending admin approval`]
        );

        await client.query('COMMIT');
        res.json({
            success: true,
            message: `Withdrawal request of ₹${parseFloat(amount).toFixed(2)} submitted. Funds will be transferred to your bank account within 24 hours after admin approval.`
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Withdrawal error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

// @route   GET /api/finance/withdrawals
// @desc    Get current user's withdrawal request history
router.get('/withdrawals', verifyToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT wr.id, wr.amount, wr.status, wr.admin_note, wr.created_at, wr.updated_at,
                    ba.bank_name, ba.account_holder_name, ba.account_number
             FROM withdrawal_requests wr
             LEFT JOIN bank_accounts ba ON wr.bank_account_id = ba.id
             WHERE wr.user_id = $1
             ORDER BY wr.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Fetch withdrawal history error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});


// @route   POST /api/finance/deposit
// @desc    Submit a deposit request (admin verifies and credits wallet)
router.post('/deposit', verifyToken, async (req, res) => {
    const { amount, utr_number } = req.body;
    try {
        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, error: 'Please provide a valid deposit amount.' });
        }
        if (!utr_number || utr_number.trim().length < 6) {
            return res.status(400).json({ success: false, error: 'Please provide a valid UTR/transaction reference number.' });
        }

        const result = await db.query(
            `INSERT INTO deposit_requests (user_id, amount, utr_number) VALUES ($1, $2, $3) RETURNING *`,
            [req.user.id, parseFloat(amount), utr_number.trim()]
        );

        res.status(201).json({
            success: true,
            message: 'Deposit request submitted successfully. Funds will be credited after admin verification (usually within 30 minutes).',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Deposit request error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/finance/deposits
// @desc    Get current user's deposit history
router.get('/deposits', verifyToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, amount, utr_number, status, admin_note, created_at 
             FROM deposit_requests WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Fetch deposits error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;

