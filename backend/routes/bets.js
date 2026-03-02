const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const { v4: uuidv4 } = require('uuid');

// @route   POST /api/bets
// @desc    Place a new bet (deducts wallet balance)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
    const client = await db.connect();
    try {
        const { game_type, round, number, amount, caption } = req.body;
        const userId = req.user.id;

        const betAmount = parseFloat(amount);
        if (isNaN(betAmount) || betAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid bet amount' });
        }

        if (!game_type || !round || !number) {
            return res.status(400).json({ success: false, error: 'Missing required bet fields' });
        }

        await client.query('BEGIN');

        // 1. Check user wallet balance
        const userRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
        if (userRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const currentBalance = parseFloat(userRes.rows[0].wallet_balance);
        if (currentBalance < betAmount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
        }

        // 2. Deduct from wallet
        const updatedUser = await client.query(
            'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2 RETURNING wallet_balance',
            [betAmount, userId]
        );

        // 3. Log transaction
        const trxId = `BET-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;
        await client.query(`
            INSERT INTO transactions (user_id, amount, type, status, description)
            VALUES ($1, $2, $3, $4, $5)
        `, [userId, -betAmount, 'BET_PLACED', 'COMPLETED', `Placed bet on ${game_type} ${round} for number ${number} (TRX: ${trxId})`]);

        // 4. Insert into user_bets
        const newBet = await client.query(`
            INSERT INTO user_bets (user_id, game_type, round, number, amount, caption, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
            RETURNING *
        `, [userId, game_type, round, number, betAmount, caption || null]);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Bet placed successfully',
            bet: newBet.rows[0],
            new_balance: updatedUser.rows[0].wallet_balance
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error placing bet:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

// @route   GET /api/bets/me
// @desc    Get current user's bet history (optional status filter)
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const statusFilter = req.query.status; // Optional: PENDING, WON, LOST, or SETTLED (WON OR LOST)
        const offset = (page - 1) * limit;

        let queryStr = `
            SELECT id, game_type, round, number, amount, caption, status, created_at
            FROM user_bets
            WHERE user_id = $1
        `;
        let countQueryStr = 'SELECT COUNT(*) FROM user_bets WHERE user_id = $1';
        let queryParams = [userId];

        let paramIndex = 2;

        if (statusFilter) {
            if (statusFilter.toUpperCase() === 'SETTLED') {
                queryStr += ` AND status IN ('WON', 'LOST')`;
                countQueryStr += ` AND status IN ('WON', 'LOST')`;
            } else {
                queryStr += ` AND status = $${paramIndex}`;
                countQueryStr += ` AND status = $${paramIndex}`;
                queryParams.push(statusFilter.toUpperCase());
                paramIndex++;
            }
        }

        queryStr += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const bets = await db.query(queryStr, queryParams);
        const countRes = await db.query(countQueryStr, statusFilter && statusFilter.toUpperCase() !== 'SETTLED' ? [userId, statusFilter.toUpperCase()] : [userId]);

        res.json({
            success: true,
            count: bets.rows.length,
            total: parseInt(countRes.rows[0].count),
            data: bets.rows
        });
    } catch (err) {
        console.error('Error fetching user bets:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
