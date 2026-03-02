const db = require('./db');
async function run() {
    const ts = '2026-03-01 15:42:26.418Z';
    const res = await db.query(`
    SELECT 
      $1::timestamp as original_utc,
      ($1::timestamp AT TIME ZONE 'UTC') as aware_utc,
      ($1::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') as local_kst_time,
      ($1::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE as local_date
  `, [ts]);
    console.log(res.rows);

    const res2 = await db.query(`
    SELECT id, amount, created_at, 
      (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') as local_time,
      (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE as local_date 
    FROM user_bets WHERE id = 6
  `);
    console.log(res2.rows);

    process.exit(0);
}
run();
