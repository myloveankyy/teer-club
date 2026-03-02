const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyAdmin = require('../middleware/verifyAdmin');

// ==================
// WITHDRAWAL ROUTES
// ==================

// @route   GET /api/admin/finance/withdrawals
// @desc    Get all withdrawal requests (PENDING first)
// @access  Admin
router.get('/withdrawals', verifyAdmin, async (req, res) => {
    try {
        const status = req.query.status; // Optional filter: PENDING, APPROVED, REJECTED
        const values = [];
        let whereClause = '';
        if (status) {
            values.push(status);
            whereClause = `WHERE wr.status = $1`;
        }

        const result = await db.query(`
            SELECT 
                wr.id, wr.amount, wr.status, wr.admin_note,
                wr.created_at, wr.updated_at,
                u.username, u.email,
                ba.bank_name, ba.account_holder_name,
                ba.account_number, ba.ifsc_code
            FROM withdrawal_requests wr
            JOIN users u ON wr.user_id = u.id
            LEFT JOIN bank_accounts ba ON wr.bank_account_id = ba.id
            ${whereClause}
            ORDER BY 
                CASE wr.status WHEN 'PENDING' THEN 0 ELSE 1 END,
                wr.created_at DESC
        `, values);

        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        console.error('[Admin Withdrawals] Fetch error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/admin/finance/withdrawals/:id/approve
// @desc    Approve a withdrawal request (wallet already deducted at request time)
// @access  Admin
router.put('/withdrawals/:id/approve', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { admin_note } = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const wrRes = await client.query(
            `SELECT * FROM withdrawal_requests WHERE id = $1 FOR UPDATE`,
            [id]
        );
        if (wrRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Withdrawal request not found' });
        }

        const wr = wrRes.rows[0];
        if (wr.status !== 'PENDING') {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: `Cannot approve — request is already ${wr.status}` });
        }

        // Mark APPROVED
        await client.query(
            `UPDATE withdrawal_requests SET status = 'APPROVED', admin_note = $1, updated_at = NOW() WHERE id = $2`,
            [admin_note || null, id]
        );

        // Update transaction record — Postgres doesn't allow ORDER BY/LIMIT in UPDATE directly; use subquery
        await client.query(
            `UPDATE transactions SET status = 'COMPLETED', description = description || ' [APPROVED]'
             WHERE id = (
                 SELECT id FROM transactions
                 WHERE user_id = $1 AND type = 'WITHDRAWAL' AND status = 'PENDING'
                 ORDER BY created_at DESC LIMIT 1
             )`,
            [wr.user_id]
        );


        // Notify user
        await client.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, 'WITHDRAWAL_APPROVED', 'Withdrawal Approved ✅', $2)`,
            [wr.user_id, `Your withdrawal of ₹${wr.amount} has been approved and will be credited to your bank account shortly.`]
        );

        await client.query('COMMIT');
        res.json({ success: true, message: `Withdrawal #${id} approved successfully.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Admin Withdrawals] Approve error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

// @route   PUT /api/admin/finance/withdrawals/:id/reject
// @desc    Reject a withdrawal and REFUND the wallet
// @access  Admin
router.put('/withdrawals/:id/reject', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { admin_note } = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const wrRes = await client.query(
            `SELECT * FROM withdrawal_requests WHERE id = $1 FOR UPDATE`,
            [id]
        );
        if (wrRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Withdrawal request not found' });
        }

        const wr = wrRes.rows[0];
        if (wr.status !== 'PENDING') {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: `Cannot reject — request is already ${wr.status}` });
        }

        // Mark REJECTED
        await client.query(
            `UPDATE withdrawal_requests SET status = 'REJECTED', admin_note = $1, updated_at = NOW() WHERE id = $2`,
            [admin_note || 'Rejected by admin', id]
        );

        // REFUND wallet — the money was deducted when the user submitted
        await client.query(
            `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
            [wr.amount, wr.user_id]
        );

        // Record refund transaction
        await client.query(
            `INSERT INTO transactions (user_id, type, amount, status, description)
             VALUES ($1, 'CREDIT', $2, 'COMPLETED', $3)`,
            [wr.user_id, wr.amount, `[REFUND] Withdrawal request #${id} rejected — ₹${wr.amount} returned to wallet.`]
        );

        // Notify user
        await client.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, 'WITHDRAWAL_REJECTED', 'Withdrawal Rejected ❌', $2)`,
            [wr.user_id, `Your withdrawal request of ₹${wr.amount} was rejected. The amount has been refunded to your wallet. ${admin_note ? `Reason: ${admin_note}` : ''}`]
        );

        await client.query('COMMIT');
        res.json({ success: true, message: `Withdrawal #${id} rejected and ₹${wr.amount} refunded to user.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Admin Withdrawals] Reject error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

// ==================
// DEPOSIT ROUTES
// ==================

// @route   GET /api/admin/finance/deposits
// @desc    Get all deposit requests
// @access  Admin
router.get('/deposits', verifyAdmin, async (req, res) => {
    try {
        const status = req.query.status;
        const values = [];
        let whereClause = '';
        if (status) {
            values.push(status);
            whereClause = `WHERE dr.status = $1`;
        }

        const result = await db.query(`
            SELECT 
                dr.id, dr.amount, dr.utr_number, dr.status, dr.admin_note,
                dr.created_at, dr.updated_at,
                u.username, u.email
            FROM deposit_requests dr
            JOIN users u ON dr.user_id = u.id
            ${whereClause}
            ORDER BY 
                CASE dr.status WHEN 'PENDING' THEN 0 ELSE 1 END,
                dr.created_at DESC
        `, values);

        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        console.error('[Admin Deposits] Fetch error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/admin/finance/deposits/:id/approve
// @desc    Approve a deposit request — credit wallet and notify user
// @access  Admin
router.put('/deposits/:id/approve', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { admin_note } = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const drRes = await client.query(
            `SELECT * FROM deposit_requests WHERE id = $1 FOR UPDATE`,
            [id]
        );
        if (drRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Deposit request not found' });
        }

        const dr = drRes.rows[0];
        if (dr.status !== 'PENDING') {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: `Cannot approve — request is already ${dr.status}` });
        }

        // Mark APPROVED
        await client.query(
            `UPDATE deposit_requests SET status = 'APPROVED', admin_note = $1, updated_at = NOW() WHERE id = $2`,
            [admin_note || null, id]
        );

        // Credit wallet
        await client.query(
            `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
            [dr.amount, dr.user_id]
        );

        // Record transaction
        await client.query(
            `INSERT INTO transactions (user_id, type, amount, status, description)
             VALUES ($1, 'CREDIT', $2, 'COMPLETED', $3)`,
            [dr.user_id, dr.amount, `[DEPOSIT] ₹${dr.amount} deposited via UPI (UTR: ${dr.utr_number || 'N/A'}) — Ref: DEP-${id}`]
        );

        // Notify user
        await client.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, 'DEPOSIT_APPROVED', 'Deposit Credited 💰', $2)`,
            [dr.user_id, `Your deposit of ₹${dr.amount} has been verified and added to your wallet.`]
        );

        await client.query('COMMIT');
        res.json({ success: true, message: `Deposit #${id} approved — ₹${dr.amount} credited to user.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Admin Deposits] Approve error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

// @route   PUT /api/admin/finance/deposits/:id/reject
// @desc    Reject a deposit request and notify user
// @access  Admin
router.put('/deposits/:id/reject', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { admin_note } = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const drRes = await client.query(
            `SELECT * FROM deposit_requests WHERE id = $1 FOR UPDATE`,
            [id]
        );
        if (drRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Deposit request not found' });
        }

        const dr = drRes.rows[0];
        if (dr.status !== 'PENDING') {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: `Cannot reject — request is already ${dr.status}` });
        }

        await client.query(
            `UPDATE deposit_requests SET status = 'REJECTED', admin_note = $1, updated_at = NOW() WHERE id = $2`,
            [admin_note || 'Rejected by admin', id]
        );

        await client.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, 'DEPOSIT_REJECTED', 'Deposit Rejected ❌', $2)`,
            [dr.user_id, `Your deposit request of ₹${dr.amount} was rejected. ${admin_note ? `Reason: ${admin_note}` : 'Please contact support for assistance.'}`]
        );

        await client.query('COMMIT');
        res.json({ success: true, message: `Deposit #${id} rejected.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Admin Deposits] Reject error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

module.exports = router;
