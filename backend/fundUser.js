require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcrypt');

async function fund() {
    console.log("Starting funding script...");
    try {
        const username = 'teer_guru';
        const password = '12345678';
        const email = 'teerguru@example.com';
        const amount = 100000;

        const res = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (res.rows.length > 0) {
            await db.query('UPDATE users SET wallet_balance = wallet_balance + $1 WHERE username = $2', [amount, username]);
            console.log(`Updated existing user ${username} with Rs ${amount}`);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            await db.query(`
                INSERT INTO users (username, email, password_hash, wallet_balance, status) 
                VALUES ($1, $2, $3, $4, 'ACTIVE')
            `, [username, email, hash, amount]);
            console.log(`Created new user ${username} with Rs ${amount}`);
        }
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        process.exit(0);
    }
}

fund();
