const db = require('./db');
async function run() {
    try {
        const res = await db.query("SELECT gm.role, gm.group_id, u.username FROM group_members gm JOIN users u ON gm.user_id = u.id WHERE gm.role = 'MODERATOR'");
        console.log('Moderators:', res.rows);

        const teerRes = await db.query("SELECT * FROM users WHERE username = 'Teer_guru'");
        console.log('Teer Guru user record:', teerRes.rows);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
