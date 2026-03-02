const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const crypto = require('crypto');

// @route   GET /api/groups
// @desc    Get all active public groups and their member counts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const groupsRes = await db.query(`
            SELECT g.id, g.name, g.short_description as description, 
                   g.icon_url, g.image_key, g.category, g.is_public,
                   (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as members
            FROM groups g
            WHERE g.is_public = true
            ORDER BY g.created_at ASC
        `);

        // Format for frontend — use image_key with fallback to derived key from icon_url, category with fallback
        const formattedGroups = groupsRes.rows.map(g => ({
            id: g.id.toString(),
            name: g.name,
            members: parseInt(g.members),
            description: g.description || 'Welcome to the community.',
            isPrivate: !g.is_public,
            category: g.category || 'General',
            image: g.image_key || g.icon_url || 'default'  // frontend gradient key
        }));

        res.json(formattedGroups);
    } catch (err) {
        console.error('Error fetching groups:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});


// @route   GET /api/groups/:id
// @desc    Get single group details and check membership status
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
    try {
        console.log(`[Group Details] Hit with ID: ${req.params.id}, User: ${req.user.id}`);
        const { id } = req.params;
        const userId = req.user.id;

        if (isNaN(id) || parseInt(id) <= 0) {
            console.log("[Group Details] Invalid ID parsed, treating as 404");
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        console.log("[Group Details] Querying group...");
        const groupRes = await db.query('SELECT * FROM groups WHERE id = $1', [id]);
        if (groupRes.rows.length === 0) {
            console.log("[Group Details] 404 Group Not Found");
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        console.log("[Group Details] Querying members list...");
        const memberRes = await db.query('SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        const isMember = memberRes.rows.length > 0;
        const role = isMember ? memberRes.rows[0].role : null;

        console.log("[Group Details] Querying total member count...");
        const countRes = await db.query('SELECT COUNT(*) FROM group_members WHERE group_id = $1', [id]);

        console.log("[Group Details] Sending success response...");
        res.json({
            success: true,
            group: {
                ...groupRes.rows[0],
                memberCount: parseInt(countRes.rows[0].count)
            },
            isMember,
            role
        });
    } catch (err) {
        console.error('[Group Details] FATAL ERROR:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/groups/:id/join
// @desc    Join a group
// @access  Private
router.post('/:id/join', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if group exists
        const groupRes = await db.query('SELECT id FROM groups WHERE id = $1', [id]);
        if (groupRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        // Check if already a member
        const memberRes = await db.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        if (memberRes.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Already a member of this group' });
        }

        // Join group
        await db.query(
            'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
            [id, userId, 'MEMBER']
        );

        res.json({ success: true, message: 'Joined group successfully' });
    } catch (err) {
        console.error('Error joining group:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/groups/:id/messages
// @desc    Get group chat history
// @access  Private
router.get('/:id/messages', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify membership
        const memberRes = await db.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        if (memberRes.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Not a member of this group' });
        }

        // Fetch messages with user info
        const msgRes = await db.query(`
            SELECT m.id, m.content, m.created_at, u.id as user_id, u.username, u.reputation
            FROM group_messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.group_id = $1
            ORDER BY m.created_at ASC
            LIMIT 100
        `, [id]);

        res.json({ success: true, count: msgRes.rows.length, data: msgRes.rows });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/groups/:id/messages
// @desc    Send a message to the group chat
// @access  Private
router.post('/:id/messages', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, error: 'Message content is required' });
        }

        // Verify membership
        const memberRes = await db.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        if (memberRes.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Not a member of this group' });
        }

        // Insert message
        const newMsg = await db.query(`
            INSERT INTO group_messages (group_id, user_id, content) 
            VALUES ($1, $2, $3)
            RETURNING id, content, created_at
        `, [id, userId, content.trim()]);

        // Fetch user data to append to the response
        const userRes = await db.query('SELECT username, reputation FROM users WHERE id = $1', [userId]);

        const fullMessage = {
            ...newMsg.rows[0],
            user_id: userId,
            username: userRes.rows[0].username,
            reputation: userRes.rows[0].reputation
        };

        res.json({ success: true, data: fullMessage });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/groups/:id/search-users
// @desc    Search users by username to top up
// @access  Private
router.get('/:id/search-users', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { q } = req.query;

        // Verify membership & role
        const memberRes = await db.query('SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        if (memberRes.rows.length === 0 || memberRes.rows[0].role !== 'MODERATOR') {
            return res.status(403).json({ success: false, error: 'Access denied. Moderators only.' });
        }

        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const usersRes = await db.query(`
            SELECT id, username, email 
            FROM users 
            WHERE username ILIKE $1 
            LIMIT 10
        `, [`%${q}%`]);

        res.json({ success: true, count: usersRes.rows.length, data: usersRes.rows });
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/groups/:id/topup
// @desc    Top up a user's wallet from group's wallet balance
// @access  Private
router.post('/:id/topup', verifyToken, async (req, res) => {
    const client = await db.connect();
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { targetUserId, amount } = req.body;

        const topupAmount = parseFloat(amount);
        if (isNaN(topupAmount) || topupAmount <= 0) {
            client.release();
            return res.status(400).json({ success: false, error: 'Invalid amount' });
        }

        if (!targetUserId) {
            client.release();
            return res.status(400).json({ success: false, error: 'Target user ID is required' });
        }

        // Verify moderator role
        const memberRes = await client.query('SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        if (memberRes.rows.length === 0 || memberRes.rows[0].role !== 'MODERATOR') {
            client.release();
            return res.status(403).json({ success: false, error: 'Access denied. Moderators only.' });
        }

        await client.query('BEGIN');

        // Check target user
        const targetRes = await client.query('SELECT username FROM users WHERE id = $1 FOR UPDATE', [targetUserId]);
        if (targetRes.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ success: false, error: 'Target user not found' });
        }

        // Check group balance
        const groupRes = await client.query('SELECT name, wallet_balance FROM groups WHERE id = $1 FOR UPDATE', [id]);
        if (groupRes.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        const currentBalance = parseFloat(groupRes.rows[0].wallet_balance);
        if (currentBalance < topupAmount) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ success: false, error: 'Insufficient group wallet balance' });
        }

        // Deduct from group
        await client.query('UPDATE groups SET wallet_balance = wallet_balance - $1 WHERE id = $2', [topupAmount, id]);

        // Add to user
        await client.query('UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2', [topupAmount, targetUserId]);

        // Log transaction for the user
        await client.query(`
            INSERT INTO transactions (user_id, amount, type, status, description)
            VALUES ($1, $2, $3, $4, $5)
        `, [targetUserId, topupAmount, 'GROUP_TOPUP', 'COMPLETED', `Received from group: ${groupRes.rows[0].name}`]);

        // Generate unique transaction ID for moderator history
        const trxId = `MOD-TRX-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Log transaction for the moderator audit history
        await client.query(`
            INSERT INTO group_topups (transaction_id, group_id, moderator_id, user_id, amount)
            VALUES ($1, $2, $3, $4, $5)
        `, [trxId, id, userId, targetUserId, topupAmount]);

        // --- NEW: Trigger In-App Notification for Target User ---
        const modRes = await client.query('SELECT username FROM users WHERE id = $1', [userId]);
        const moderatorName = modRes.rows.length > 0 ? modRes.rows[0].username : 'A Moderator';

        await client.query(`
            INSERT INTO notifications (user_id, message, type)
            VALUES ($1, $2, $3)
        `, [targetUserId, `You received ₹${topupAmount} from ${moderatorName} in ${groupRes.rows[0].name}.`, 'GROUP_TOPUP']);

        await client.query('COMMIT');
        client.release();

        res.json({ success: true, message: `Successfully topped up user's wallet with ₹${topupAmount}` });
    } catch (err) {
        await client.query('ROLLBACK');
        if (client) client.release();
        console.error('Error topping up user:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/groups/:id/leaderboard
// @desc    Get top 10 members of the group by reputation
// @access  Private
router.get('/:id/leaderboard', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify membership
        const memberRes = await db.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        if (memberRes.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Not a member of this group' });
        }

        const leaderboardRes = await db.query(`
            SELECT u.id, u.username, u.reputation, gm.role 
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = $1
            ORDER BY u.reputation DESC
            LIMIT 10
        `, [id]);

        res.json({ success: true, count: leaderboardRes.rows.length, data: leaderboardRes.rows });
    } catch (err) {
        console.error('Error fetching group leaderboard:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
