const db = require('./db');
const axios = require('axios');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function runTest() {
    try {
        const username = 'teer_guru';
        console.log(`Starting gift test for ${username}...`);

        // Check initial balance
        const initialRes = await db.query('SELECT wallet_balance FROM users WHERE username = $1', [username]);
        console.log('Initial wallet balance:', initialRes.rows[0].wallet_balance);

        // Generate an admin token for the internal API call
        const token = jwt.sign({ username: 'myloveankyy', role: 'master' }, process.env.JWT_SECRET || 'super_secret_fallback_key', { expiresIn: '1h' });

        console.log('Dispatching ₹500 via the API... (POST /api/admin/gifts/user)');

        try {
            const apiRes = await axios.post('http://127.0.0.1:5000/api/admin/gifts/user', {
                username: username,
                amount: 500,
                message: "Test System Verification"
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('API Response:', apiRes.data.message);
        } catch (e) {
            console.error('API Error:', e.response?.data || e.message);
            process.exit(1);
        }

        // Check new balance
        const finalRes = await db.query('SELECT wallet_balance FROM users WHERE username = $1', [username]);
        console.log('Final wallet balance:', finalRes.rows[0].wallet_balance);

        // Check transactions
        const txRes = await db.query('SELECT * FROM transactions WHERE user_id = (SELECT id FROM users WHERE username = $1) ORDER BY created_at DESC LIMIT 1', [username]);
        console.log('Latest Transaction Record:', txRes.rows[0]);

    } catch (e) {
        console.error('Failed test:', e);
    } finally {
        process.exit(0);
    }
}

runTest();
