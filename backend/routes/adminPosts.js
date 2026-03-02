const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyAdmin = require('../middleware/verifyAdmin');

// @route   GET /api/admin/posts
// @desc    Get all blog posts (including unpublished)
// @access  Private (Admin)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const postsRes = await db.query(`
            SELECT id, title, slug, category, is_published, created_at, updated_at
            FROM posts
            ORDER BY created_at DESC
        `);
        res.json({ success: true, count: postsRes.rows.length, data: postsRes.rows });
    } catch (err) {
        console.error('Error fetching admin posts:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/admin/posts/:id
// @desc    Get a specific blog post
// @access  Private (Admin)
router.get('/:id', verifyAdmin, async (req, res) => {
    try {
        const postRes = await db.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
        if (postRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        res.json({ success: true, data: postRes.rows[0] });
    } catch (err) {
        console.error('Error fetching admin post:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/admin/posts
// @desc    Create a new blog post
// @access  Private (Admin)
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { title, slug, category, excerpt, content, featured_image, is_published } = req.body;
        // Basic validation
        if (!title || !slug || !category || !content) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields' });
        }

        // Check if slug exists
        const slugCheck = await db.query('SELECT id FROM posts WHERE slug = $1', [slug]);
        if (slugCheck.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'A post with this slug already exists' });
        }

        const newPost = await db.query(`
            INSERT INTO posts (title, slug, category, excerpt, content, featured_image, is_published, author_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NULL)
            RETURNING *
        `, [title, slug, category, excerpt, content, featured_image, is_published || false]);

        res.status(201).json({ success: true, message: 'Post created successfully', data: newPost.rows[0] });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/admin/posts/:id
// @desc    Update a blog post
// @access  Private (Admin)
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, category, excerpt, content, featured_image, is_published } = req.body;

        const postCheck = await db.query('SELECT id FROM posts WHERE id = $1', [id]);
        if (postCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        // Check slug collision
        if (slug) {
            const slugCheck = await db.query('SELECT id FROM posts WHERE slug = $1 AND id != $2', [slug, id]);
            if (slugCheck.rows.length > 0) {
                return res.status(400).json({ success: false, error: 'A post with this slug already exists' });
            }
        }

        const updatedPost = await db.query(`
            UPDATE posts 
            SET title = COALESCE($1, title),
                slug = COALESCE($2, slug),
                category = COALESCE($3, category),
                excerpt = COALESCE($4, excerpt),
                content = COALESCE($5, content),
                featured_image = COALESCE($6, featured_image),
                is_published = COALESCE($7, is_published),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
        `, [title, slug, category, excerpt, content, featured_image, is_published !== undefined ? is_published : null, id]);

        res.json({ success: true, message: 'Post updated successfully', data: updatedPost.rows[0] });
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   DELETE /api/admin/posts/:id
// @desc    Delete a blog post
// @access  Private (Admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteRes = await db.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
        if (deleteRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        res.json({ success: true, message: 'Post deleted' });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
