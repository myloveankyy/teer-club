const db = require('./db');

async function seedCleanPost() {
    try {
        await db.query('DELETE FROM posts WHERE slug = $1', ['teer-strategy-2026']);

        await db.query(`
            INSERT INTO posts (title, slug, category, excerpt, content, is_published, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        `, [
            'Mastering the Art of Teer Strategy',
            'teer-strategy-2026',
            'Strategy',
            'Unlock the hidden patterns of Shillong and Khanapara Teer with our expert analysis and historical depth.',
            '## Deep Insights\n\nTeer is more than a game of numbers. It is a fusion of culture, intuition, and statistical probability.\n\n### The Mechanics of Success\n\nOne of the most powerful strategies is to track the "Common Numbers" over a rolling 30-day window...',
            true
        ]);

        console.log('Seeded one clean post for testing.');
    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        process.exit();
    }
}

seedCleanPost();
