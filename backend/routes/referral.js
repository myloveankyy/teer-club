const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// @route   GET /api/referral/stats
// @desc    Get user referral stats and levels
// @access  Private
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user referral code
        const userRes = await db.query('SELECT referral_code FROM users WHERE id = $1', [userId]);
        const referralCode = userRes.rows[0].referral_code;

        // Get direct referrals count
        const directRes = await db.query('SELECT COUNT(*) FROM users WHERE referred_by_id = $1', [userId]);
        const directCount = parseInt(directRes.rows[0].count);

        // Get total earnings from referrals
        const earningsRes = await db.query(`
            SELECT SUM(amount) as total 
            FROM transactions 
            WHERE user_id = $1 AND type = 'REFERRAL_EARNING' AND status = 'COMPLETED'
        `, [userId]);
        const totalEarnings = parseFloat(earningsRes.rows[0].total || 0);

        // Level distribution (Calculated)
        // Note: For large systems, we would pre-calculate this. For now, we query up to 5 levels.

        // Level 1: Direct
        const level1 = directCount;

        // Level 2: Referred by those referred by me
        const level2Res = await db.query(`
            SELECT COUNT(*) FROM users 
            WHERE referred_by_id IN (SELECT id FROM users WHERE referred_by_id = $1)
        `, [userId]);
        const level2 = parseInt(level2Res.rows[0].count);

        // Level 3
        const level3Res = await db.query(`
            SELECT COUNT(*) FROM users 
            WHERE referred_by_id IN (
                SELECT id FROM users WHERE referred_by_id IN (
                    SELECT id FROM users WHERE referred_by_id = $1
                )
            )
        `, [userId]);
        const level3 = parseInt(level3Res.rows[0].count);

        // Level 4
        const level4Res = await db.query(`
            SELECT COUNT(*) FROM users 
            WHERE referred_by_id IN (
                SELECT id FROM users WHERE referred_by_id IN (
                    SELECT id FROM users WHERE referred_by_id IN (
                        SELECT id FROM users WHERE referred_by_id = $1
                    )
                )
            )
        `, [userId]);
        const level4 = parseInt(level4Res.rows[0].count);

        // Level 5
        const level5Res = await db.query(`
            SELECT COUNT(*) FROM users 
            WHERE referred_by_id IN (
                SELECT id FROM users WHERE referred_by_id IN (
                    SELECT id FROM users WHERE referred_by_id IN (
                        SELECT id FROM users WHERE referred_by_id IN (
                            SELECT id FROM users WHERE referred_by_id = $1
                        )
                    )
                )
            )
        `, [userId]);
        const level5 = parseInt(level5Res.rows[0].count);

        res.json({
            success: true,
            data: {
                referralCode,
                referralLink: `https://teer.club/invite/${referralCode}`,
                totalEarnings,
                stats: {
                    level1,
                    level2,
                    level3,
                    level4,
                    level5,
                    total: level1 + level2 + level3 + level4 + level5
                }
            }
        });

    } catch (err) {
        console.error('Referral stats error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/referral/connections
// @desc    Get full list of connections across 5 levels
// @access  Private
router.get('/connections', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Recursive CTE to fetch 5 levels of referrals
        const connectionsRes = await db.query(`
            WITH RECURSIVE referral_tree AS (
                -- Base case: Level 1 (Direct referrals)
                SELECT 
                    id, 
                    username, 
                    profile_picture, 
                    created_at, 
                    referred_by_id, 
                    1 as level
                FROM users 
                WHERE referred_by_id = $1

                UNION ALL

                -- Recursive step: Levels 2 to 5
                SELECT 
                    u.id, 
                    u.username, 
                    u.profile_picture, 
                    u.created_at, 
                    u.referred_by_id, 
                    rt.level + 1
                FROM users u
                INNER JOIN referral_tree rt ON u.referred_by_id = rt.id
                WHERE rt.level < 5
            )
            SELECT * FROM referral_tree ORDER BY level ASC, created_at DESC;
        `, [userId]);

        // Group by level for easier frontend consumption
        const grouped = {
            level1: [],
            level2: [],
            level3: [],
            level4: [],
            level5: []
        };

        connectionsRes.rows.forEach(row => {
            grouped[`level${row.level}`].push({
                id: row.id,
                username: row.username,
                profilePicture: row.profile_picture,
                connectedAt: row.created_at
            });
        });

        res.json({
            success: true,
            data: grouped
        });

    } catch (err) {
        console.error('Referral connections error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/referral/earnings
// @desc    Get detailed referral transaction history
// @access  Private
router.get('/earnings', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const earnings = await db.query(`
            SELECT id, amount, description, created_at 
            FROM transactions 
            WHERE user_id = $1 AND type = 'REFERRAL_EARNING' 
            ORDER BY created_at DESC
        `, [userId]);

        res.json({
            success: true,
            data: earnings.rows
        });

    } catch (err) {
        console.error('Referral earnings error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
