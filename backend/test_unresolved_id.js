const db = require('./db');
async function test() {
    try {
        const id = "undefined"; // Testing the hypothetical bug
        console.log(`Testing with id: \${id}`);
        const groupRes = await db.query('SELECT * FROM groups WHERE id = $1', [id]);
        console.log("Group query success:", groupRes.rows.length);
        process.exit(0);
    } catch (err) {
        console.error("DB Error (this confirms the bug!):", err.message);
        process.exit(1);
    }
}
test();
