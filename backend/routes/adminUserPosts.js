const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyAdmin = require('../middleware/verifyAdmin');

// @route   GET /api/admin/user-posts
// @desc    Get all user prediction posts from the feed (with filters)
// @access  Admin
router.get('/', verifyAdmin, async (req, res) => {
    try {
        console.log('[Admin User Posts] GET / - Query:', req.query);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const search = req.query.search?.trim() || '';
        const gameType = req.query.game_type || '';

        const conditions = [];
        const values = [];

        if (search) {
            values.push(`%${search}%`);
            conditions.push(`(u.username ILIKE $${values.length} OR ub.caption ILIKE $${values.length} OR ub.number ILIKE $${values.length})`);
        }

        if (gameType) {
            values.push(gameType);
            conditions.push(`ub.game_type = $${values.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        values.push(limit, offset);

        console.log('[Admin User Posts] Executing Query:', {
            where: whereClause,
            values: values,
            limit: values[values.length - 2],
            offset: values[values.length - 1]
        });

        const result = await db.query(`
            SELECT 
                ub.id,
                ub.game_type,
                ub.round,
                ub.number,
                ub.amount,
                ub.caption,
                ub.likes,
                ub.created_at,
                u.id as user_id,
                COALESCE(u.username, 'Unknown') as username,
                COALESCE(u.email, '—') as email
            FROM user_bets ub
            LEFT JOIN users u ON ub.user_id = u.id
            ${whereClause}
            ORDER BY ub.created_at DESC
            LIMIT $${values.length - 1} OFFSET $${values.length}
        `, values);

        console.log('[Admin User Posts] Found:', result.rows.length, 'Total:', result.rowCount);

        const countResult = await db.query(`
            SELECT COUNT(*) FROM user_bets ub
            LEFT JOIN users u ON ub.user_id = u.id
            ${whereClause}
        `, values.slice(0, -2));

        const totalCount = parseInt(countResult.rows[0].count);
        console.log('[Admin User Posts] Total Count in DB:', totalCount);

        res.json({
            success: true,
            count: result.rows.length,
            total: parseInt(countResult.rows[0].count),
            page,
            data: result.rows
        });
    } catch (err) {
        console.error('[Admin User Posts] Fetch error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   DELETE /api/admin/user-posts/:id
// @desc    Delete a user post (moderation — T&C violation)
// @access  Admin
router.delete('/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Fetch post info before deleting
        const postRes = await client.query(
            `SELECT ub.id, ub.user_id, ub.caption, ub.number, ub.game_type, u.username
             FROM user_bets ub
             LEFT JOIN users u ON ub.user_id = u.id
             WHERE ub.id = $1`,
            [id]
        );

        if (postRes.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        const post = postRes.rows[0];

        // Delete bet_likes first (FK constraint)
        await client.query('DELETE FROM bet_likes WHERE bet_id = $1', [id]);

        // Delete the post
        await client.query('DELETE FROM user_bets WHERE id = $1', [id]);

        // Notify the user if we know who they are
        if (post.user_id) {
            const noteMsg = reason
                ? `Your post "${post.number}" on ${post.game_type} was removed. Reason: ${reason}`
                : `Your post "${post.number}" on ${post.game_type} was removed by an admin for violating our Terms & Conditions.`;

            await client.query(
                `INSERT INTO notifications (user_id, type, title, message)
                 VALUES ($1, 'POST_REMOVED', 'Post Removed ⚠️', $2)`,
                [post.user_id, noteMsg]
            );
        }

        await client.query('COMMIT');
        res.json({
            success: true,
            message: `Post #${id} by @${post.username} deleted and user notified.`
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Admin User Posts] Delete error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

// @route   POST /api/admin/user-posts/:id/warn
// @desc    Warn a user about their post (without deleting)
// @access  Admin
router.post('/:id/warn', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const postRes = await db.query(
            `SELECT ub.id, ub.user_id, ub.number, ub.game_type, u.username
             FROM user_bets ub
             LEFT JOIN users u ON ub.user_id = u.id
             WHERE ub.id = $1`,
            [id]
        );

        if (postRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        const post = postRes.rows[0];

        if (!post.user_id) {
            return res.status(400).json({ success: false, error: 'Cannot warn — post has no linked user.' });
        }

        const warnMsg = reason
            ? `Your post "${post.number}" on ${post.game_type} received an admin warning. Reason: ${reason}`
            : `Your post "${post.number}" on ${post.game_type} was flagged for potentially violating our Terms & Conditions. Please review our community guidelines.`;

        await db.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, 'POST_WARNED', 'Content Warning ⚠️', $2)`,
            [post.user_id, warnMsg]
        );

        res.json({
            success: true,
            message: `Warning sent to @${post.username}.`
        });
    } catch (err) {
        console.error('[Admin User Posts] Warn error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
