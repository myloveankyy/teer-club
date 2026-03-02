const db = require('./db');
async function test() {
    try {
        const id = "1";
        const userId = 2; // Assuming active user

        const groupRes = await db.query('SELECT * FROM groups WHERE id = $1', [id]);
        console.log("Group query success:", groupRes.rows.length);

        const memberRes = await db.query('SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        console.log("Member query success:", memberRes.rows.length);

        const countRes = await db.query('SELECT COUNT(*) FROM group_members WHERE group_id = $1', [id]);
        console.log("Count query success:", countRes.rows);

        process.exit(0);
    } catch (err) {
        console.error("DB Error:", err);
        process.exit(1);
    }
}
test();
