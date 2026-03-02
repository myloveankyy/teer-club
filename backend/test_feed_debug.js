const db = require('./db');

async function testFeed() {
    try {
        console.log('Starting feed test...');
        const feedQuery = `
            SELECT 
                user_bets.id,
                user_bets.game_type,
                user_bets.round,
                user_bets.number,
                user_bets.amount,
                user_bets.caption,
                user_bets.created_at,
                users.username as author_name
            FROM user_bets
            JOIN users ON user_bets.user_id = users.id
            ORDER BY user_bets.created_at DESC
            LIMIT 20 OFFSET 0
        `;

        const feedRes = await db.query(feedQuery);
        console.log(`Query successful. Rows: ${feedRes.rows.length}`);

        const enhancedFeed = feedRes.rows.map(post => ({
            ...post,
            likes: Math.floor(Math.random() * 50) + 1,
            isTrending: Math.random() > 0.8
        }));

        console.log('Mapping successful.');
        console.log(JSON.stringify(enhancedFeed[0], null, 2));

        process.exit(0);
    } catch (err) {
        console.error('FEED TEST FAILED:', err);
        process.exit(1);
    }
}

testFeed();
