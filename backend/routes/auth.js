const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

const { processReferralRewards } = require('../services/referralService');

// @route   POST /api/auth/register
// @desc    Register a a new Teer Club user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, referralCode } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields' });
        }

        // Check if user already exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Username or email already exists' });
        }

        // Validate Referral Code if provided
        let referredById = null;
        if (referralCode) {
            const referrer = await db.query('SELECT id FROM users WHERE LOWER(referral_code) = LOWER($1)', [referralCode]);
            if (referrer.rows.length > 0) {
                referredById = referrer.rows[0].id;
            } else {
                return res.status(400).json({ success: false, error: 'Invalid or non-existent referral code.' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        // Note: New user's referral code defaults to their username
        const newUser = await db.query(
            `INSERT INTO users (username, email, password_hash, referred_by_id, referral_code, profile_picture)
             VALUES ($1, $2, $3, $4, $1, '/uploads/profiles/default-avatar.png')
             RETURNING id, username, email, profile_picture, status, reputation`,
            [username, email, hashedPassword, referredById]
        );

        const newUserId = newUser.rows[0].id;

        // Trigger Referral Rewards if applicable
        if (referredById) {
            // Run in background to not delay response
            processReferralRewards(newUserId, referredById).catch(err => console.error('Referral Processing Error:', err));
        }

        // Sign JWT Payload
        const payload = {
            id: newUserId,
            username: newUser.rows[0].username,
            status: newUser.rows[0].status
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;

                // Set HTTP-Only Cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });

                res.json({
                    success: true,
                    user: newUser.rows[0]
                });
            }
        );

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});


// @route   POST /api/auth/login
// @desc    Authenticate User & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        // Check if user exists
        const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid Credentials' });
        }

        const user = userRes.rows[0];

        // Check user status
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, error: `Account is ${user.status}. Please contact support.` });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Invalid Credentials' });
        }

        // Sign JWT Payload
        const payload = {
            id: user.id,
            username: user.username,
            status: user.status
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;

                // Set HTTP-Only Cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });

                res.json({
                    success: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        status: user.status,
                        reputation: user.reputation
                    }
                });
            }
        );

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});


// @route   GET /api/auth/me
// @desc    Get current logged in user profile
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userRes = await db.query('SELECT id, username, email, profile_picture, status, reputation, wallet_balance, bio, created_at FROM users WHERE id = $1', [req.user.id]);

        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, user: userRes.rows[0] });

    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
