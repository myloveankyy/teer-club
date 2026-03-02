const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Middleware to verify if user has ANY moderator roles
const verifyAnyModerator = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const modRes = await db.query(
            "SELECT group_id FROM group_members WHERE user_id = $1 AND role = 'MODERATOR'",
            [userId]
        );
        if (modRes.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Access denied. You are not a moderator of any group.' });
        }
        req.modGroups = modRes.rows.map(r => r.group_id);
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error verifying moderator status.' });
    }
};

// @route   GET /api/moderator/groups
// @desc    Get all groups where current user is a moderator 
router.get('/groups', verifyToken, verifyAnyModerator, async (req, res) => {
    try {
        const groupIds = req.modGroups;

        const groupsRes = await db.query(`
            SELECT id, name, icon_url, wallet_balance
            FROM groups
            WHERE id = ANY($1)
            ORDER BY name ASC
        `, [groupIds]);

        res.json({ success: true, groups: groupsRes.rows });
    } catch (err) {
        console.error('Error fetching mod groups:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/moderator/users/search
// @desc    Search users by username for transferring funds
router.get('/users/search', verifyToken, verifyAnyModerator, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ success: true, users: [] });
        }

        const usersRes = await db.query(`
            SELECT id, username, reputation
            FROM users
            WHERE username ILIKE $1
            LIMIT 10
        `, [`%${q}%`]);

        res.json({ success: true, users: usersRes.rows });
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/moderator/groups/:id/transfer
// @desc    Transfer funds from a group wallet to a user wallet
router.post('/groups/:id/transfer', verifyToken, async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const moderatorId = req.user.id;
        const groupId = req.params.id;
        const { receiverId, amount } = req.body;

        const transferAmount = parseFloat(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Invalid transfer amount' });
        }

        // 1. Verify moderator has access to THIS specific group
        const modCheck = await client.query(
            "SELECT 1 FROM group_members WHERE user_id = $1 AND group_id = $2 AND role = 'MODERATOR'",
            [moderatorId, groupId]
        );
        if (modCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'You are not a moderator of this group.' });
        }

        // 2. Lock and check Group Wallet Balance
        const groupRes = await client.query('SELECT name, wallet_balance FROM groups WHERE id = $1 FOR UPDATE', [groupId]);
        const group = groupRes.rows[0];

        if (parseFloat(group.wallet_balance) < transferAmount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Insufficient group wallet balance.' });
        }

        // 3. Verify Receiver Exists
        const receiverRes = await client.query('SELECT username FROM users WHERE id = $1', [receiverId]);
        if (receiverRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Receiver not found.' });
        }

        // 4. Execute Transfer (Deduct from Group, Add to User)
        await client.query('UPDATE groups SET wallet_balance = wallet_balance - $1 WHERE id = $2', [transferAmount, groupId]);
        await client.query('UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2', [transferAmount, receiverId]);

        // 5. Log Transaction
        await client.query(`
            INSERT INTO group_transactions (group_id, moderator_id, receiver_id, amount, type)
            VALUES ($1, $2, $3, $4, 'FUND_GROUP_TO_USER')
        `, [groupId, moderatorId, receiverId, transferAmount]);

        // 6. Broadcast Notification to Receiver
        await client.query(`
            INSERT INTO notifications (user_id, type, title, message)
            VALUES ($1, 'FUNDS_RECEIVED_FROM_MOD', $2, $3)
        `, [
            receiverId,
            'Funds Received! 💰',
            `You just received ₹${transferAmount.toFixed(2)} from the ${group.name} Community!`
        ]);

        await client.query('COMMIT');
        res.json({ success: true, message: `Successfully transferred ₹${transferAmount} to ${receiverRes.rows[0].username}` });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in mod transfer:', err);
        res.status(500).json({ success: false, message: 'Server error during transfer.' });
    } finally {
        client.release();
    }
});

module.exports = router;
