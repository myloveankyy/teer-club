const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Get all unread notifications for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            "SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC LIMIT 20",
            [userId]
        );
        res.json({ success: true, notifications: result.rows });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Mark all notifications as read
router.put('/read-all', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
            [userId]
        );
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        console.error("Error updating notifications:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Mark a notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await db.query(
            "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id",
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Notification not found or access denied" });
        }

        res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
