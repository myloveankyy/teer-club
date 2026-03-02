const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyAdmin = require('../middleware/verifyAdmin');

// Ensure table exists on every request (simple auto-migration)
async function ensureTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS changelogs (
            id SERIAL PRIMARY KEY,
            version VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'announcement',
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
}

// ─── PUBLIC: Get all changelogs ───────────────────────────────────────────────
async function getChangelogs(req, res) {
    try {
        await ensureTable();
        const result = await db.query(`
            SELECT id, version, title, description, type, created_at
            FROM changelogs
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('GET changelogs error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

router.get('/', getChangelogs);
router.get('', getChangelogs);

// ─── ADMIN: Create a new changelog entry ─────────────────────────────────────
async function createChangelog(req, res) {
    const { version, title, description, type } = req.body;

    if (!version || !title || !description) {
        return res.status(400).json({ success: false, message: 'version, title, and description are required' });
    }

    const validTypes = ['feature', 'improvement', 'bugfix', 'security', 'announcement'];
    const changelogType = validTypes.includes(type) ? type : 'announcement';

    try {
        await ensureTable();
        const result = await db.query(`
            INSERT INTO changelogs (version, title, description, type)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [version, title, description, changelogType]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('POST changelog error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

router.post('/', verifyAdmin, createChangelog);
router.post('', verifyAdmin, createChangelog);

// ─── ADMIN: Delete a changelog entry ─────────────────────────────────────────
router.delete('/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM changelogs WHERE id = $1', [id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        console.error('DELETE changelog error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
