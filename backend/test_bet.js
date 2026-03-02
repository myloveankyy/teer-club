const axios = require('axios');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function run() {
    try {
        // Create token for myloveankyy or teer_guru
        // Actually, let's use the DB directly to find the ID of teer_guru
        const db = require('./db');
        const userRes = await db.query('SELECT id, username, email FROM users WHERE username = $1', ['teer_guru']);
        const user = userRes.rows[0];

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET || 'super_secret',
            { expiresIn: '1h' }
        );

        console.log('Token created for teer_guru');

        const res = await axios.post('http://127.0.0.1:5000/api/bets', {
            game_type: 'Shillong Teer',
            round: 'Round 1',
            number: '42',
            amount: 75,
            caption: 'Phase 13 Test'
        }, {
            headers: {
                Cookie: `token=${token}`
            }
        });

        console.log('Success:', res.data.message);
        console.log('Balance:', res.data.new_balance);

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.response?.data || e);
        process.exit(1);
    }
}

run();
