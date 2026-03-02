const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/admin/settings
// @desc    Get all global app settings
// @access  Private (Admin Only)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT key, value, description FROM settings');

        // Return as key-value pairs
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });

        res.json(settings);
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   PUT /api/admin/settings
// @desc    Update global app settings
// @access  Private (Admin Only)
router.put('/', async (req, res) => {
    try {
        const updates = req.body;

        // Iterate over keys and values, update or insert
        for (const [key, value] of Object.entries(updates)) {
            await db.query(`
                INSERT INTO settings (key, value)
                VALUES ($1, $2)
                ON CONFLICT (key) DO UPDATE 
                SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
            `, [key, JSON.stringify(value)]);
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
