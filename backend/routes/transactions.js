const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// @route   GET /api/transactions/me
// @desc    Get user's complete transaction history
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const txRes = await db.query(
            `SELECT id, amount, type, status, description, created_at 
             FROM transactions 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({ success: true, count: txRes.rows.length, data: txRes.rows });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/transactions/moderator-history
// @desc    Get top-up history made by the currently logged-in moderator
// @access  Private
router.get('/moderator-history', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const historyRes = await db.query(`
            SELECT 
                gt.id, gt.transaction_id, gt.amount, gt.created_at,
                g.name as group_name,
                u.username as target_username
            FROM group_topups gt
            JOIN groups g ON gt.group_id = g.id
            JOIN users u ON gt.user_id = u.id
            WHERE gt.moderator_id = $1
            ORDER BY gt.created_at DESC
        `, [userId]);

        res.json({ success: true, count: historyRes.rows.length, data: historyRes.rows });
    } catch (err) {
        console.error('Error fetching moderator history:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
