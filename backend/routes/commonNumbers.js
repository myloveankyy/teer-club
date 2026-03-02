const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const { generateCommonNumbersWithAI } = require('../services/aiService');

/**
 * @desc Get today's common numbers for all games
 * @route GET /api/common-numbers/today
 */
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const results = await db.query(
            "SELECT * FROM common_numbers WHERE target_date = $1",
            [today]
        );

        if (results.rows.length === 0) {
            // If none found for today, try to generate or return empty
            // For now, let's just return what we have or nothing
            return res.json({ success: true, data: [] });
        }

        res.json({ success: true, data: results.rows });
    } catch (err) {
        console.error("Error fetching today's common numbers:", err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

/**
 * @desc Generate today's common numbers using AI (Manual trigger)
 * @route POST /api/common-numbers/generate
 */
router.post('/generate', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const games = ['Shillong', 'Khanapara', 'Juwai'];
        const savedRecords = [];

        for (const game of games) {
            const aiData = await generateCommonNumbersWithAI(game);

            // Insert or Update
            const result = await db.query(
                `INSERT INTO common_numbers (game, target_date, house, ending, direct_numbers)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (game, target_date) 
                 DO UPDATE SET house = EXCLUDED.house, ending = EXCLUDED.ending, direct_numbers = EXCLUDED.direct_numbers
                 RETURNING *`,
                [game, today, aiData.house, aiData.ending, aiData.direct_numbers]
            );
            savedRecords.push(result.rows[0]);
        }

        // --- Send Global Notification ---
        const userRes = await db.query("SELECT id FROM users");
        const notificationPromises = userRes.rows.map(u =>
            db.query(
                "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
                [u.id, "Target Numbers Updated!", `Today's AI-generated House & Ending numbers for Shillong, Khanapara, and Juwai are now live.`, "INFO"]
            )
        );
        await Promise.all(notificationPromises);

        res.json({ success: true, message: "Common numbers generated successfully", data: savedRecords });
    } catch (err) {
        console.error("Error generating common numbers:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @desc Save a common number card to user library
 * @route POST /api/common-numbers/save
 */
router.post('/save', verifyToken, async (req, res) => {
    try {
        const { common_number_id } = req.body;
        const userId = req.user.id;

        await db.query(
            "INSERT INTO saved_common_numbers (user_id, common_number_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [userId, common_number_id]
        );

        res.json({ success: true, message: "Card saved to library" });
    } catch (err) {
        console.error("Error saving common numbers:", err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

/**
 * @desc Get user's saved common numbers library
 * @route GET /api/common-numbers/library
 */
router.get('/library', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT cn.*, scn.saved_at 
             FROM common_numbers cn
             JOIN saved_common_numbers scn ON cn.id = scn.common_number_id
             WHERE scn.user_id = $1
             ORDER BY cn.target_date DESC, scn.saved_at DESC`,
            [userId]
        );

        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error fetching library:", err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

module.exports = router;
