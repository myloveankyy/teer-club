const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// @route   GET /api/feed
// @desc    Get the social prediction feed (recent bets from all users)
// @access  Public (Numbers may be masked by frontend if not logged in)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Fetch recent bets with real like counts and trending flag
        const feedQuery = `
            SELECT 
                ub.id,
                ub.game_type,
                ub.round,
                ub.number,
                ub.amount,
                ub.caption,
                ub.created_at,
                ub.likes,
                ub.comments_count,
                COALESCE(u.username, 'Anonymous Hunter') as author_name,
                COALESCE(u.profile_picture, '/uploads/profiles/default-avatar.png') as author_picture,
                CASE WHEN ub.likes >= 5 THEN TRUE ELSE FALSE END as is_trending
            FROM user_bets ub
            LEFT JOIN users u ON ub.user_id = u.id
            ORDER BY ub.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const countQuery = 'SELECT COUNT(*) FROM user_bets';

        const [feedRes, countRes] = await Promise.all([
            db.query(feedQuery, [limit, offset]),
            db.query(countQuery)
        ]);

        const rowCount = feedRes.rows ? feedRes.rows.length : 0;
        const totalCount = (countRes.rows && countRes.rows[0]) ? parseInt(countRes.rows[0].count || 0) : 0;

        res.json({
            success: true,
            count: rowCount,
            total: totalCount,
            data: feedRes.rows || []
        });
    } catch (err) {
        console.error('[Feed Route Error]:', { message: err.message, query: req.query });
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: 'Failed to fetch community feed'
        });
    }
});

// @route   POST /api/feed/:id/like
// @desc    Like a prediction post
// @access  Private
router.post('/:id/like', verifyToken, async (req, res) => {
    const betId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(betId)) {
        return res.status(400).json({ success: false, error: 'Invalid post ID' });
    }

    try {
        // Insert like — ON CONFLICT means already liked, so treat as toggle
        await db.query(
            `INSERT INTO bet_likes (user_id, bet_id) VALUES ($1, $2) ON CONFLICT (user_id, bet_id) DO NOTHING`,
            [userId, betId]
        );

        // Increment denormalized counter
        await db.query(
            `UPDATE user_bets SET likes = (SELECT COUNT(*) FROM bet_likes WHERE bet_id = $1) WHERE id = $1`,
            [betId]
        );

        const likeCount = await db.query('SELECT likes FROM user_bets WHERE id = $1', [betId]);
        res.json({ success: true, likes: likeCount.rows[0]?.likes || 0 });
    } catch (err) {
        console.error('[Like Error]:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   DELETE /api/feed/:id/like
// @desc    Unlike a prediction post
// @access  Private
router.delete('/:id/like', verifyToken, async (req, res) => {
    const betId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(betId)) {
        return res.status(400).json({ success: false, error: 'Invalid post ID' });
    }

    try {
        await db.query(
            `DELETE FROM bet_likes WHERE user_id = $1 AND bet_id = $2`,
            [userId, betId]
        );

        // Sync denormalized counter
        await db.query(
            `UPDATE user_bets SET likes = (SELECT COUNT(*) FROM bet_likes WHERE bet_id = $1) WHERE id = $1`,
            [betId]
        );

        const likeCount = await db.query('SELECT likes FROM user_bets WHERE id = $1', [betId]);
        res.json({ success: true, likes: likeCount.rows[0]?.likes || 0 });
    } catch (err) {
        console.error('[Unlike Error]:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
