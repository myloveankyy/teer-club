const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// @route   POST /api/dreams/:dream_id/like
// @desc    Toggle a like on a dream card for the current day
// @access  Private (Logged in Users only)
router.post('/:dream_id/like', verifyToken, async (req, res) => {
    try {
        const { dream_id } = req.params;
        const userId = req.user.id;

        // Check if the user already liked it today
        const checkRes = await db.query(
            'SELECT * FROM dream_likes WHERE user_id = $1 AND dream_id = $2 AND liked_at = CURRENT_DATE',
            [userId, dream_id]
        );

        if (checkRes.rows.length > 0) {
            // Un-like (Toggle off)
            await db.query(
                'DELETE FROM dream_likes WHERE id = $1',
                [checkRes.rows[0].id]
            );
            return res.json({ success: true, message: 'Like removed', liked_today: false });
        } else {
            // Add Like
            await db.query(
                'INSERT INTO dream_likes (user_id, dream_id, liked_at) VALUES ($1, $2, CURRENT_DATE)',
                [userId, dream_id]
            );
            return res.json({ success: true, message: 'Like added', liked_today: true });
        }
    } catch (err) {
        console.error('Error toggling dream like:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// @route   GET /api/dreams/:dream_id/likes
// @desc    Get total likes and user's current like status for a dream card
// @access  Public (Optional User Auth)
router.get('/:dream_id/likes', async (req, res) => {
    try {
        const { dream_id } = req.params;

        // Try to get user.id if logged in (from cookies or header), but don't strictly require it
        let userId = null;
        const token = req.cookies?.token;
        if (token) {
            const jwt = require('jsonwebtoken');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (e) { /* ignore invalid tokens for a public route */ }
        }

        const totalRes = await db.query(
            'SELECT COUNT(*) FROM dream_likes WHERE dream_id = $1 AND liked_at = CURRENT_DATE',
            [dream_id]
        );

        let userLikedToday = false;
        if (userId) {
            const userRes = await db.query(
                'SELECT 1 FROM dream_likes WHERE user_id = $1 AND dream_id = $2 AND liked_at = CURRENT_DATE',
                [userId, dream_id]
            );
            userLikedToday = userRes.rows.length > 0;
        }

        res.json({
            success: true,
            total_likes: parseInt(totalRes.rows[0].count, 10),
            user_liked_today: userLikedToday
        });

    } catch (err) {
        console.error('Error fetching dream likes:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
