const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function run() {
    try {
        const db = require('./db');
        const userRes = await db.query('SELECT id, username, email FROM users WHERE username = $1', ['teer_guru']);
        const user = userRes.rows[0];

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET || 'super_secret',
            { expiresIn: '1h' }
        );

        console.log('Token created for teer_guru');
        const headers = { Cookie: `token=${token}` };

        // 1. Join Group 1 (Official VIP)
        try {
            const joinRes = await axios.post('http://127.0.0.1:5000/api/groups/1/join', {}, { headers });
            console.log('Join Group:', joinRes.data.message);
        } catch (e) {
            console.log('Join Group:', e.response?.data?.error || 'Already Member');
        }

        // 2. Send Message
        const msgRes = await axios.post('http://127.0.0.1:5000/api/groups/1/messages', {
            content: "Hey everyone! Feeling lucky about 42 today. Any thoughts?"
        }, { headers });
        console.log('Message Sent:', msgRes.data.data.content);

        // 3. Fetch Chat History
        const fetchRes = await axios.get('http://127.0.0.1:5000/api/groups/1/messages', { headers });
        console.log(`\nChat History (Last ${fetchRes.data.count} messages):`);
        fetchRes.data.data.forEach(m => {
            console.log(`[${m.username}]: ${m.content}`);
        });

        process.exit(0);
    } catch (e) {
        console.error('Test Error:', e.response?.data || e);
        process.exit(1);
    }
}

run();
