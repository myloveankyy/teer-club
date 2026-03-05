const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/public/posts
// @desc    Get all published blog posts
// @access  Public
router.get('/', async (req, res) => {
    console.log('[API] Public Posts: Fetching all posts');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const category = req.query.category;

        let queryStr = `
            SELECT p.id, p.title, p.slug, p.category, p.excerpt, p.featured_image, p.featured_image_alt, p.created_at, u.username as author_name, p.meta_title, p.meta_description
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.is_published = TRUE
        `;
        let countQueryStr = 'SELECT COUNT(*) FROM posts WHERE is_published = TRUE';
        let queryParams = [];
        let countParams = [];

        if (category && category !== 'All') {
            queryStr += ` AND p.category = $1`;
            countQueryStr += ` AND category = $1`;
            queryParams.push(category);
            countParams.push(category);

            queryStr += ` ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`;
            queryParams.push(limit, offset);
        } else {
            queryStr += ` ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`;
            queryParams.push(limit, offset);
        }

        const postsRes = await db.query(queryStr, queryParams);
        const countRes = await db.query(countQueryStr, countParams);

        console.log(`[API] Public Posts: Successfully fetched ${postsRes.rows.length} posts`);
        res.json({
            success: true,
            count: postsRes.rows.length,
            total: parseInt(countRes.rows[0].count),
            data: postsRes.rows
        });
    } catch (err) {
        console.error('Error fetching public posts:', err);
        res.status(500).json({ success: false, error: 'Server Error', message: err.message });
    }
});

// @route   GET /api/public/posts/:slug
// @desc    Get a specific published blog post by slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const postRes = await db.query(`
            SELECT p.*, u.username as author_name
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.slug = $1 AND p.is_published = TRUE
        `, [req.params.slug]);

        if (postRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        // Increment view count
        await db.query('UPDATE posts SET views = views + 1 WHERE id = $1', [postRes.rows[0].id]);

        res.json({ success: true, data: postRes.rows[0] });
    } catch (err) {
        console.error('Error fetching public post:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
