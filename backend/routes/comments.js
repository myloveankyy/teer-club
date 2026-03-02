const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// @route   GET /api/comments/:bet_id
// @desc    Get comments for a specific bet
// @access  Public
router.get('/:bet_id', async (req, res) => {
    const betId = parseInt(req.params.bet_id);
    if (isNaN(betId)) return res.status(400).json({ success: false, error: 'Invalid bet ID' });

    try {
        const query = `
            SELECT 
                bc.id,
                bc.bet_id,
                bc.user_id,
                bc.parent_id,
                bc.content,
                bc.created_at,
                u.username,
                u.profile_picture,
                u.status as user_status
            FROM bet_comments bc
            JOIN users u ON bc.user_id = u.id
            WHERE bc.bet_id = $1
            ORDER BY bc.created_at ASC
        `;
        const result = await db.query(query, [betId]);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        console.error('[Get Comments Error]:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/comments/
// @desc    Add a comment or reply to a bet post
// @access  Private
router.post('/', verifyToken, async (req, res) => {
    const { bet_id, content, parent_id } = req.body;
    const userId = req.user.id;

    if (!bet_id || !content) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        // Core Insert
        const insertQuery = `
            INSERT INTO bet_comments (bet_id, user_id, content, parent_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, created_at
        `;
        const result = await db.query(insertQuery, [bet_id, userId, content, parent_id || null]);

        // Sync denormalized count on user_bets
        await db.query(`
            UPDATE user_bets SET comments_count = (SELECT COUNT(*) FROM bet_comments WHERE bet_id = $1)
            WHERE id = $1
        `, [bet_id]);

        // Get the full new comment object to return
        const newCommentQuery = `
            SELECT bc.*, u.username, u.profile_picture
            FROM bet_comments bc
            JOIN users u ON bc.user_id = u.id
            WHERE bc.id = $1
        `;
        const commentData = await db.query(newCommentQuery, [result.rows[0].id]);

        res.json({ success: true, data: commentData.rows[0], message: 'Comment posted successfully' });
    } catch (err) {
        console.error('[Add Comment Error]:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment (must be original author)
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
    const commentId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        const checkOwner = await db.query('SELECT user_id, bet_id FROM bet_comments WHERE id = $1', [commentId]);
        if (checkOwner.rows.length === 0) return res.status(404).json({ success: false, error: 'Comment not found' });

        const betId = checkOwner.rows[0].bet_id;
        if (checkOwner.rows[0].user_id !== userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized to delete this comment' });
        }

        await db.query('DELETE FROM bet_comments WHERE id = $1 OR parent_id = $1', [commentId]);

        // Sync count
        await db.query(`
            UPDATE user_bets SET comments_count = (SELECT COUNT(*) FROM bet_comments WHERE bet_id = $1)
            WHERE id = $1
        `, [bet_id]);

        res.json({ success: true, message: 'Comment deleted' });
    } catch (err) {
        console.error('[Delete Comment Error]:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
