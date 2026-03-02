const db = require('./db');

async function inspectData() {
    try {
        const res = await db.query('SELECT * FROM posts LIMIT 1');
        const post = res.rows[0];
        if (!post) {
            console.log('No posts found');
            return;
        }

        console.log('Post ID:', post.id);
        console.log('Title:', JSON.stringify(post.title));
        console.log('Excerpt:', JSON.stringify(post.excerpt));
        console.log('Featured Image:', JSON.stringify(post.featured_image));

        // Check for control characters in excerpt
        const controlChars = post.excerpt.split('').filter(c => c.charCodeAt(0) < 32);
        if (controlChars.length > 0) {
            console.log('Control characters found in excerpt:', controlChars.map(c => c.charCodeAt(0)));
        } else {
            console.log('No control characters in excerpt.');
        }

    } catch (err) {
        console.error('Inspect failed:', err);
    } finally {
        process.exit();
    }
}

inspectData();
