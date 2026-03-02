const db = require('./db');
async function run() {
    const res = await db.query("SELECT id, amount, created_at FROM user_bets WHERE amount = 2760");
    console.log(res.rows);
    const res2 = await db.query("SELECT id, amount, created_at, (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE AS local_date FROM user_bets ORDER BY created_at DESC LIMIT 5");
    console.log(res2.rows);
    process.exit(0);
}
run();
