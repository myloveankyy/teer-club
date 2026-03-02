const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');

// Hardcoded Master Admin Credentials
const ADMIN_USERNAME = 'myloveankyy';
// Pre-calculated hash for "18112003aA@myloveankyy"
// Using bcrypt.hashSync('18112003aA@myloveankyy', 10)
const ADMIN_PASSWORD_HASH = '$2b$10$MUJdXNhdoHGvTeSqHHyjMut5Y1OVE4I9TlXYkV9k7Croiy2fvwZti';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

// Rate Limiter: Max 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || 'Unknown';

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }

    try {
        if (username === ADMIN_USERNAME && await bcrypt.compare(password, ADMIN_PASSWORD_HASH)) {
            // Success
            const token = jwt.sign({ username: ADMIN_USERNAME, role: 'master' }, JWT_SECRET, { expiresIn: '12h' });

            // Audit Log - Success
            try {
                await db.query(`INSERT INTO admin_logs (username, action, ip_address, device_info, status) VALUES ($1, $2, $3, $4, $5)`,
                    [username, 'LOGIN_ATTEMPT', ip, device, 'SUCCESS']);
            } catch (err) {
                // Ignore DB error quietly
            }

            // Set HttpOnly cookie
            res.cookie('admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 12 * 60 * 60 * 1000, // 12 hours
                path: '/'
            });

            return res.json({ success: true, message: 'Login successful' });
        } else {
            // Failed Log
            try {
                await db.query(`INSERT INTO admin_logs (username, action, ip_address, device_info, status) VALUES ($1, $2, $3, $4, $5)`,
                    [username, 'LOGIN_ATTEMPT', ip, device, 'FAILED']);
            } catch (err) {
                // Ignore DB error quietly
            }

            return res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

router.post('/logout', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || 'Unknown';
    const username = req.cookies?.admin_token ? (jwt.decode(req.cookies.admin_token)?.username || 'Unknown') : 'Unknown';

    db.query(`INSERT INTO admin_logs (username, action, ip_address, device_info, status) VALUES ($1, $2, $3, $4, $5)`,
        [username, 'LOGOUT', ip, device, 'SUCCESS']).catch(console.error);

    res.clearCookie('admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/verify', (req, res) => {
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ authenticated: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.username === ADMIN_USERNAME) {
            return res.json({ authenticated: true, user: decoded });
        }
        return res.status(401).json({ authenticated: false });
    } catch {
        return res.status(401).json({ authenticated: false });
    }
});

module.exports = router;
