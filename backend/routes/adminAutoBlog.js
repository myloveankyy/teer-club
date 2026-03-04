const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const { generateAutoBlogPost } = require('../services/autoBlogService');
const db = require('../db');

// @route   POST /api/admin/auto-blog/generate
// @desc    One-click AI blog post generation
// @access  Private (Admin)
router.post('/generate', verifyAdmin, async (req, res) => {
    // Override the 35s default timeout — AI generation takes 60-90s
    res.setTimeout(120000);

    try {
        console.log('[Admin] Auto blog generation triggered by admin');

        const result = await generateAutoBlogPost();

        res.status(201).json({
            success: true,
            message: `Blog post "${result.title}" has been published and indexed!`,
            data: result,
        });
    } catch (error) {
        console.error('[Admin] Auto blog generation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate blog post. Please try again.',
        });
    }
});

// @route   GET /api/admin/auto-blog/history
// @desc    Get history of AI-generated blog posts
// @access  Private (Admin)
router.get('/history', verifyAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, title, slug, category, excerpt, featured_image, 
                   meta_title, focus_keyword, generation_theme, views,
                   is_published, created_at
            FROM posts 
            WHERE is_ai_generated = true 
            ORDER BY created_at DESC 
            LIMIT 20
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error('[Admin] Failed to fetch auto-blog history:', error);
        // Graceful fallback if column doesn't exist yet
        res.json({ success: true, count: 0, data: [] });
    }
});

module.exports = router;
