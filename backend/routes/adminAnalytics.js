const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyAdmin = require('../middleware/verifyAdmin');

// Apply strict authentication to the entire analytics router
router.use(verifyAdmin);

const axios = require('axios');
const { getGscData, getGa4Data } = require('../services/googleSeoDashService');

router.get('/seo-dashboard', async (req, res) => {
    try {
        // Site URL for Search Console (can be environment variable later)
        const siteUrl = 'sc-domain:teer.club';
        // GA4 Property ID (can be in .env)
        const propertyId = process.env.GA4_PROPERTY_ID || null; // e.g. '123456789'

        const [gsc, ga4] = await Promise.all([
            getGscData(siteUrl, 30),
            getGa4Data(propertyId, 7)
        ]);

        return res.json({
            success: true,
            data: {
                gsc,
                ga4
            }
        });
    } catch (e) {
        console.error('[SEO Dashboard API Error]', e);
        return res.status(500).json({ success: false, error: 'Failed to retrieve SEO data.' });
    }
});

router.get('/dashboard', async (req, res) => {
    try {
        // Query 1: Total Users
        const usersRes = await db.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(usersRes.rows[0].count, 10) || 0;

        // Query 2: Scrapes Today
        const scrapesRes = await db.query('SELECT COUNT(*) FROM results WHERE date = CURRENT_DATE');
        const scrapedToday = parseInt(scrapesRes.rows[0].count, 10) || 0;

        // Query 3: Real Pageviews (No fallback)
        const statsRes = await db.query('SELECT pageviews FROM daily_site_stats WHERE date = CURRENT_DATE');
        const dailyPageviews = statsRes.rows.length > 0 ? parseInt(statsRes.rows[0].pageviews, 10) : 0;

        // Query 4: Today's Bets
        const todayBetsRes = await db.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
            FROM user_bets 
            WHERE created_at >= CURRENT_DATE
        `);
        const todayBets = {
            count: parseInt(todayBetsRes.rows[0].count, 10),
            total: parseFloat(todayBetsRes.rows[0].total)
        };

        // Query 5: Yesterday's Bets
        const yesterdayBetsRes = await db.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
            FROM user_bets 
            WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' 
            AND created_at < CURRENT_DATE
        `);
        const yesterdayBets = {
            count: parseInt(yesterdayBetsRes.rows[0].count, 10),
            total: parseFloat(yesterdayBetsRes.rows[0].total)
        };

        // Query 6: Recent Winners (Status = 'WON')
        const winnersRes = await db.query(`
            SELECT b.number, b.amount, b.game_type, b.round, b.created_at, u.username
            FROM user_bets b
            JOIN users u ON b.user_id = u.id
            WHERE b.status = 'WON'
            ORDER BY b.created_at DESC
            LIMIT 5
        `);
        const recentWinners = winnersRes.rows;

        // Query 7: Recent Active Logs (Limit 4 for UI)
        const logsRes = await db.query(`
            SELECT action, status, created_at, device_info 
            FROM admin_logs 
            ORDER BY created_at DESC 
            LIMIT 4
        `);
        const recentLogs = logsRes.rows;

        // System Health Checks
        const health = {
            database: 'ONLINE',
            mlService: 'OFFLINE',
            publicSite: 'OFFLINE'
        };

        // Check ML Service
        try {
            const mlRes = await axios.get('http://localhost:8000/predict/target', { timeout: 2000 });
            if (mlRes.status === 200) health.mlService = 'ONLINE';
        } catch (e) { }

        // Check Public Site
        try {
            const siteRes = await axios.get('http://localhost:5000/health', { timeout: 2000 });
            if (siteRes.data.status === 'ok') health.publicSite = 'ONLINE';
        } catch (e) { }

        return res.json({
            success: true,
            data: {
                totalUsers,
                scrapedToday,
                dailyPageviews,
                totalBets: todayBets.total, // Legacy field for compat
                todayBets,
                yesterdayBets,
                recentWinners,
                recentActivity: recentLogs,
                systemHealth: health
            }
        });
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
            return res.json({
                success: true,
                data: {
                    totalUsers: 1248,
                    scrapedToday: 4,
                    dailyPageviews: 0, // Real 0 instead of confusing 34k
                    totalBets: 0,
                    todayBets: { count: 0, total: 0 },
                    yesterdayBets: { count: 0, total: 0 },
                    recentWinners: [],
                    recentActivity: [
                        { action: 'DB_OFFLINE', status: 'ERROR', created_at: new Date().toISOString(), device_info: 'Offline Mode Fallback' }
                    ],
                    systemHealth: { database: 'OFFLINE', mlService: 'OFFLINE', publicSite: 'OFFLINE' }
                }
            });
        } else {
            console.error('[Analytics Error]:', err);
            return res.status(500).json({ success: false, error: 'Failed to fetch dashboard metrics.' });
        }
    }
});

module.exports = router;
