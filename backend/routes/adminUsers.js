const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/admin/users
// @desc    Get all users (excluding passwords)
// @access  Private (Admin Only)
router.get('/', async (req, res) => {
    try {
        const usersRes = await db.query(`
            SELECT id, username, email, status, reputation, profile_picture, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);

        res.json({ success: true, count: usersRes.rows.length, data: usersRes.rows });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/admin/users/:id/action
// @desc    Update a user's status (ACTIVE, BLOCKED, BANNED, DEACTIVATED)
// @access  Private (Admin Only)
router.put('/:id/action', async (req, res) => {
    const client = await db.connect();
    try {
        const { id } = req.params;
        const { status, adminUsername = 'Admin' } = req.body;

        // Validate status
        const validStatuses = ['ACTIVE', 'BLOCKED', 'BANNED', 'DEACTIVATED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status provided' });
        }

        await client.query('BEGIN');

        // Update User
        const updateRes = await client.query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, username, status',
            [status, id]
        );

        if (updateRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = updateRes.rows[0];

        // Insert Audit Log
        await client.query(`
            INSERT INTO admin_logs (username, action, status, device_info) 
            VALUES ($1, $2, $3, $4)
        `, [
            adminUsername,
            `CHANGED_USER_STATUS_${status}_FOR_ID_${id}_(${user.username})`,
            'SUCCESS',
            req.headers['user-agent'] || 'Unknown'
        ]);

        await client.query('COMMIT');

        res.json({ success: true, message: `User status updated to ${status}`, user });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating user status:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Permanently delete a user
// @access  Private (Admin Only)
router.delete('/:id', async (req, res) => {
    const client = await db.connect();
    try {
        const { id } = req.params;
        const { adminUsername = 'Admin' } = req.body; // In production this comes from the verifyAdmin payload

        await client.query('BEGIN');

        const userRes = await client.query('SELECT username FROM users WHERE id = $1', [id]);
        if (userRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const username = userRes.rows[0].username;

        // Note: ON DELETE CASCADE in schema handles group_members, user_bets, forum_posts, etc.
        await client.query('DELETE FROM users WHERE id = $1', [id]);

        // Insert Audit Log
        await client.query(`
            INSERT INTO admin_logs (username, action, status, device_info) 
            VALUES ($1, $2, $3, $4)
        `, [
            adminUsername,
            `DELETED_USER_ACCOUNT_ID_${id}_(${username})`,
            'SUCCESS',
            req.headers['user-agent'] || 'Unknown'
        ]);

        await client.query('COMMIT');

        res.json({ success: true, message: `User ${username} permanently deleted` });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting user:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

// @route   GET /api/admin/users/:username/resolve
// @desc    Instantly resolve a username to check validity (UPI style)
// @access  Private (Admin Only)
router.get('/:username/resolve', async (req, res) => {
    try {
        const { username } = req.params;
        const userRes = await db.query('SELECT id, username, status, created_at FROM users WHERE username = $1', [username]);

        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: userRes.rows[0] });
    } catch (err) {
        console.error('Error resolving user:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/admin/users/:id/details
// @desc    Get comprehensive user details (profile, connections, activity)
// @access  Private (Admin Only)
router.get('/:id/details', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Basic Info
        const userRes = await db.query(`
            SELECT id, username, email, status, reputation, wallet_balance, profile_picture, bio, created_at 
            FROM users WHERE id = $1
        `, [id]);

        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = userRes.rows[0];

        // 2. Connections (5 Levels)
        const connectionsRes = await db.query(`
            WITH RECURSIVE referral_tree AS (
                SELECT id, username, profile_picture, created_at, referred_by_id, 1 as level
                FROM users WHERE referred_by_id = $1
                UNION ALL
                SELECT u.id, u.username, u.profile_picture, u.created_at, u.referred_by_id, rt.level + 1
                FROM users u
                INNER JOIN referral_tree rt ON u.referred_by_id = rt.id
                WHERE rt.level < 5
            )
            SELECT * FROM referral_tree ORDER BY level ASC, created_at DESC
        `, [id]);

        // 3. Recent Activity (Bets & Transactions)
        const betsRes = await db.query(`
            SELECT * FROM user_bets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10
        `, [id]);

        const transactionsRes = await db.query(`
            SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10
        `, [id]);

        res.json({
            success: true,
            data: {
                user,
                connections: connectionsRes.rows,
                activity: {
                    bets: betsRes.rows,
                    transactions: transactionsRes.rows
                }
            }
        });

    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
