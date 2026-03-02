// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { require: true, rejectUnauthorized: false },
    connectionTimeoutMillis: 10000, // Increased to 10s for slow warm-ups
    idleTimeoutMillis: 30000,
    max: 20
});

pool.on('error', (err) => {
    console.error('Unexpected pool error:', err.message);
});

module.exports = {
    query: async (text, params, retries = 2) => {
        for (let i = 0; i <= retries; i++) {
            try {
                return await pool.query(text, params);
            } catch (error) {
                const isTimeout = error.message.includes('timeout') || error.code === 'ETIMEDOUT';
                if (isTimeout && i < retries) {
                    console.warn(`[DB Retry] Query timed out, retrying (${i + 1}/${retries})...`);
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
                throw error;
            }
        }
    },
    connect: () => pool.connect(),
};
