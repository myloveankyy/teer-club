const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/admin/notifications
// @desc    Get all recent admin logs/alerts for the Admin Panel poller
// @access  Private (Admin Only)
router.get('/', async (req, res) => {
    try {
        // We fetch the most recent admin logs to act as "notifications" for the admin panel
        // Alternatively, we can fetch from a dedicated admin_notifications table
        const result = await db.query(
            "SELECT id, action, status, created_at, username FROM admin_logs ORDER BY created_at DESC LIMIT 50"
        );
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        console.error("Error fetching admin notifications:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
