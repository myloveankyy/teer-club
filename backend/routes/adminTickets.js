const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/admin/tickets
// @desc    Get all public bets (tickets) for a specific date
// @access  Admin Private
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;

        let queryBase = `
      SELECT 
        b.id AS ticket_id, 
        b.game_type, 
        b.round, 
        b.number, 
        b.amount, 
        b.caption,
        b.status, 
        b.created_at, 
        u.id AS user_id, 
        COALESCE(u.username, 'Unknown') as username
      FROM user_bets b
      JOIN users u ON b.user_id = u.id
    `;

        let queryParams = [];
        if (date && date !== 'all') {
            queryBase += ` WHERE (b.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE = $1`;
            queryParams.push(date);
        }

        queryBase += ` ORDER BY b.created_at DESC LIMIT 1000`; // safeguard limit

        const { rows } = await db.query(queryBase, queryParams);

        // Format amounts to numbers
        const formattedRows = rows.map(row => ({
            ...row,
            amount: parseFloat(row.amount) || 0
        }));

        res.json({ success: true, tickets: formattedRows, date: date || 'all' });
    } catch (error) {
        console.error('[Admin Tickets] Error fetching tickets:', error.message);
        res.status(500).json({ success: false, error: 'Server Error', message: error.message });
    }
});

// @route   GET /api/admin/tickets/summary
// @desc    Get aggregated ticket summaries (hot numbers, total revenue) for a specific date
// @access  Admin Private
router.get('/summary', async (req, res) => {
    try {
        const { date } = req.query;

        let queryBase = `
      SELECT 
        number, 
        SUM(amount) AS total_amount, 
        COUNT(id) AS ticket_count
      FROM user_bets
    `;

        let queryParams = [];
        if (date && date !== 'all') {
            queryBase += ` WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE = $1`;
            queryParams.push(date);
        }

        queryBase += ` GROUP BY number ORDER BY total_amount DESC`;

        // Hot Numbers Aggregation
        const { rows } = await db.query(queryBase, queryParams);

        // Format the response
        let totalRevenue = 0;
        let totalTickets = 0;

        const formattedRows = rows.map(row => {
            const amt = parseFloat(row.total_amount) || 0;
            const count = parseInt(row.ticket_count, 10) || 0;
            totalRevenue += amt;
            totalTickets += count;

            return {
                number: row.number,
                total_amount: amt,
                ticket_count: count
            };
        });

        res.json({
            success: true,
            summary: {
                totalRevenue,
                totalTickets,
                hotNumbers: formattedRows
            },
            date: date || 'all'
        });
    } catch (error) {
        console.error('[Admin Tickets Summary] Error fetching summary:', error.message);
        res.status(500).json({ success: false, error: 'Server Error', message: error.message });
    }
});

// @route   GET /api/admin/tickets/:id/receipt
// @desc    Get detailed ticket info for receipt generation
// @access  Admin Private
router.get('/:id/receipt', async (req, res) => {
    try {
        const ticketId = req.params.id;

        const { rows } = await db.query(`
      SELECT 
        b.id AS ticket_id, 
        b.game_type, 
        b.round, 
        b.number, 
        b.amount, 
        b.created_at, 
        u.id AS user_id, 
        u.username
      FROM user_bets b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [ticketId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }

        const ticket = {
            ...rows[0],
            amount: parseFloat(rows[0].amount) || 0
        };

        res.json({ success: true, ticket });
    } catch (error) {
        console.error('[Admin Tickets Receipt] Error fetching ticket:', error.message);
        res.status(500).json({ success: false, error: 'Server Error', message: error.message });
    }
});

module.exports = router;
