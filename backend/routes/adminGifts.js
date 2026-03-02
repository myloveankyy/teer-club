const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyAdmin = require('../middleware/verifyAdmin');
const { v4: uuidv4 } = require('uuid');

// @route   POST /api/admin/gifts/user
// @desc    Inject wallet funds to a target user
// @access  Private (Admin)
router.post('/user', verifyAdmin, async (req, res) => {
    const client = await db.connect();

    try {
        const { username, amount, message } = req.body;

        if (!username || !amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Please provide a valid username and amount.' });
        }

        await client.query('BEGIN');

        // Check if user exists
        const userRes = await client.query('SELECT id, wallet_balance, status FROM users WHERE username = $1', [username]);
        if (userRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: `User '${username}' not found.` });
        }

        const targetUser = userRes.rows[0];

        if (targetUser.status !== 'ACTIVE') {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: `User '${username}' is not ACTIVE. Cannot gift.` });
        }

        // 1. Update Wallet Balance
        const newBalance = Number(targetUser.wallet_balance) + Number(amount);
        await client.query(
            'UPDATE users SET wallet_balance = $1 WHERE id = $2',
            [newBalance, targetUser.id]
        );

        // 2. Insert Transaction Ledger Entry
        const transactionRef = `GIFT-${uuidv4().substring(0, 8).toUpperCase()}`;
        const caption = message || `Promotional Reward by Admin`;

        await client.query(
            `INSERT INTO transactions (user_id, type, amount, status, description) 
             VALUES ($1, 'CREDIT', $2, 'COMPLETED', $3)`,
            [targetUser.id, amount, `[ADMIN_GIFT] ${caption} (Ref: ${transactionRef})`]
        );

        await client.query('COMMIT');

        // Optional: Could send automated in-app notification here if table existed

        res.json({
            success: true,
            message: `Successfully gifted ₹${amount} to ${username}`,
            data: {
                username,
                new_balance: newBalance,
                transaction_ref: transactionRef
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error processing admin gift:', err);
        res.status(500).json({ success: false, error: 'Server Error processing gift' });
    } finally {
        client.release();
    }
});

module.exports = router;
