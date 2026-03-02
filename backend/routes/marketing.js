const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyAdmin = require('../middleware/verifyAdmin');

// --- FRONTEND ROUTES ---

// Get active dummy winners for the frontend (today's or yesterday's if not generated today)
router.get('/frontend/dummy-winners', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM dummy_winners ORDER BY target_date DESC, created_at DESC LIMIT 30`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching dummy winners:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- ADMIN ROUTES ---

// Get all dummy winners
router.get('/admin/dummy-winners', verifyAdmin, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM dummy_winners ORDER BY target_date DESC, id DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching admin dummy winners:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a single manual dummy winner
router.post('/admin/dummy-winners', verifyAdmin, async (req, res) => {
    try {
        const { name, game, round, predicted_number, bet_amount, reward_amount, target_date } = req.body;
        const result = await db.query(
            `INSERT INTO dummy_winners (name, game, round, predicted_number, bet_amount, reward_amount, target_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, game, round, predicted_number, bet_amount, reward_amount, target_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating dummy winner:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a dummy winner
router.delete('/admin/dummy-winners/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM dummy_winners WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Dummy winner deleted successfully' });
    } catch (error) {
        console.error('Error deleting dummy winner:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Auto-generate winners based on declared results
router.post('/admin/dummy-winners/generate', verifyAdmin, async (req, res) => {
    try {
        const { target_date } = req.body; // Target date to base predictions on (YYYY-MM-DD)
        const dateStr = target_date || new Date().toISOString().split('T')[0];

        // Fetch results for the target date
        const resultsRes = await db.query(`SELECT * FROM results WHERE date = $1`, [dateStr]);

        let resultsToUse = resultsRes.rows[0];
        let usedDate = dateStr;

        // If no results for today, fallback to the latest available results
        if (!resultsToUse) {
            const fallbackRes = await db.query(`SELECT * FROM results ORDER BY date DESC LIMIT 1`);
            resultsToUse = fallbackRes.rows[0];
            if (resultsToUse) {
                // Ensure usedDate is a string in YYYY-MM-DD format regardless of how it's stored in db
                usedDate = resultsToUse.date instanceof Date ? resultsToUse.date.toISOString().split('T')[0] : resultsToUse.date;
                // If it's a timezone string, grab just the date part if possible
                if (typeof usedDate === 'string' && usedDate.includes('T')) {
                    usedDate = usedDate.split('T')[0];
                }
            }
        }

        if (!resultsToUse) {
            return res.status(400).json({ error: 'No results available in the database to generate winners from.' });
        }

        const indianNames = [
            'Sanjay Kumar', 'Rahul Sharma', 'Amit Patel', 'Neha Gupta', 'Priya Singh',
            'Vikram Chatterjee', 'Rajesh Das', 'Anil Verma', 'Sunita Reddy', 'Pooja Joshi',
            'Rakesh Tiwari', 'Karan Malhotra', 'Manoj Yadav', 'Sneha Kapoor', 'Arjun Nair',
            'Meera Menon', 'Suresh Babu', 'Deepak Chowdary', 'Kabir Khan', 'Ravi Shankar',
            'Aisha Sheikh', 'Imran Ali', 'Vijay Thakur'
        ];

        const games = [
            { name: 'Shillong', r1: 'round1', r2: 'round2', mult: 80 },
            { name: 'Khanapara', r1: 'khanapara_r1', r2: 'khanapara_r2', mult: 82 },
            { name: 'Juwai', r1: 'juwai_r1', r2: 'juwai_r2', mult: 80 }
        ];

        const newWinners = [];

        // Generate winners
        for (const game of games) {
            // Round 1
            const r1Result = resultsToUse[game.r1];
            if (r1Result && r1Result !== '***' && r1Result !== '') {
                // Generate 3-5 winners for this round
                const numWinners = Math.floor(Math.random() * 3) + 3;
                for (let i = 0; i < numWinners; i++) {
                    const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];
                    // Random bet amount between 10 and 200 (multiples of 10)
                    const betAmount = (Math.floor(Math.random() * 20) + 1) * 10;
                    const rewardAmount = betAmount * game.mult;

                    newWinners.push({
                        name: randomName,
                        game: game.name,
                        round: 1,
                        predicted_number: r1Result,
                        bet_amount: betAmount,
                        reward_amount: rewardAmount,
                        target_date: usedDate
                    });
                }
            }

            // Round 2
            const r2Result = resultsToUse[game.r2];
            if (r2Result && r2Result !== '***' && r2Result !== '') {
                // Generate 3-5 winners for this round
                const numWinners = Math.floor(Math.random() * 3) + 3;
                for (let i = 0; i < numWinners; i++) {
                    const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];
                    // Random bet amount between 10 and 200 (multiples of 10)
                    const betAmount = (Math.floor(Math.random() * 20) + 1) * 10;
                    const rewardAmount = betAmount * game.mult;

                    newWinners.push({
                        name: randomName,
                        game: game.name,
                        round: 2,
                        predicted_number: r2Result,
                        bet_amount: betAmount,
                        reward_amount: rewardAmount,
                        target_date: usedDate
                    });
                }
            }
        }

        // Insert winners into DB
        for (const winner of newWinners) {
            await db.query(
                `INSERT INTO dummy_winners (name, game, round, predicted_number, bet_amount, reward_amount, target_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [winner.name, winner.game, winner.round, winner.predicted_number, winner.bet_amount, winner.reward_amount, winner.target_date]
            );
        }

        res.json({
            success: true,
            message: `Successfully generated ${newWinners.length} dummy winners for ${usedDate}.`
        });

    } catch (error) {
        console.error('Error auto-generating dummy winners:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
