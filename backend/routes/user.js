const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/profiles';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

// @route   GET /api/user/profile
// @desc    Get current user profile details
// @access  Private
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userRes = await db.query(
            'SELECT id, username, email, profile_picture, bio, status, reputation, wallet_balance, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, user: userRes.rows[0] });
    } catch (err) {
        console.error('Fetch profile error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/user/profile
// @desc    Update user profile (bio, etc)
// @access  Private
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { bio, profile_picture } = req.body;

        const updatedUser = await db.query(
            'UPDATE users SET bio = COALESCE($1, bio), profile_picture = COALESCE($2, profile_picture) WHERE id = $3 RETURNING id, username, email, profile_picture, bio, reputation, wallet_balance',
            [bio, profile_picture, req.user.id]
        );

        res.json({ success: true, user: updatedUser.rows[0] });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/user/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile-picture', verifyToken, upload.single('profile_picture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        // Update DB
        await db.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [imageUrl, req.user.id]);

        res.json({
            success: true,
            imageUrl
        });
    } catch (err) {
        console.error('Upload profile picture error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/user/posts
// @desc    Get posts/predictions uploaded by the current user
// @access  Private
router.get('/posts', verifyToken, async (req, res) => {
    try {
        const postsRes = await db.query(
            'SELECT * FROM user_bets WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );

        res.json({ success: true, count: postsRes.rows.length, data: postsRes.rows });
    } catch (err) {
        console.error('Fetch user posts error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
