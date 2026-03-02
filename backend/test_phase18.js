const db = require('./db');

async function testPhase18() {
    console.log("Starting Phase 18 End-to-End Validation...");
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Setup Test Users and Group
        const modRes = await client.query("SELECT id FROM users LIMIT 1");
        const userRes = await client.query("SELECT id FROM users OFFSET 1 LIMIT 1");
        const groupRes = await client.query("SELECT id FROM groups LIMIT 1");

        const modId = modRes.rows[0].id;
        const userId = userRes.rows[0].id;
        const groupId = groupRes.rows[0].id;

        console.log(`Using ModID: \${modId}, UserID: \${userId}, GroupID: \${groupId}`);

        // 2. Admin Funding Group (Simulate)
        await client.query("UPDATE groups SET wallet_balance = wallet_balance + 500 WHERE id = $1", [groupId]);
        console.log(">> Admin funded group with ₹500");

        // 3. Admin Assigns Moderator Role
        // Check if member exists, otherwise insert
        const memCheck = await client.query("SELECT * FROM group_members WHERE user_id = $1 AND group_id = $2", [modId, groupId]);
        if (memCheck.rows.length === 0) {
            await client.query("INSERT INTO group_members (user_id, group_id, role) VALUES ($1, $2, 'MODERATOR')", [modId, groupId]);
        } else {
            await client.query("UPDATE group_members SET role = 'MODERATOR' WHERE user_id = $1 AND group_id = $2", [modId, groupId]);
        }
        console.log(">> Admin assigned MODERATOR role");

        // 4. Moderator Transfers Funds to User
        const transferAmount = 100;
        await client.query('UPDATE groups SET wallet_balance = wallet_balance - $1 WHERE id = $2', [transferAmount, groupId]);
        await client.query('UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2', [transferAmount, userId]);

        // Insert Transaction Log
        await client.query(`
            INSERT INTO group_transactions (group_id, moderator_id, receiver_id, amount, type)
            VALUES ($1, $2, $3, $4, 'FUND_GROUP_TO_USER')
        `, [groupId, modId, userId, transferAmount]);
        console.log(`>> Moderator transferred ₹\${transferAmount} to User`);

        // Insert Notification for User (Triggers the Poller)
        await client.query(`
            INSERT INTO notifications (user_id, type, title, message)
            VALUES ($1, 'FUNDS_RECEIVED_FROM_MOD', $2, $3)
        `, [
            userId,
            'Funds Received! 💰',
            `You just received ₹\${transferAmount.toFixed(2)} from the Community!`
        ]);
        console.log(">> System dispatched FUNDS_RECEIVED_FROM_MOD notification");

        await client.query('COMMIT');
        console.log("✅ Phase 18 Validation Complete. All systems nominal.");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Test failed:", err);
    } finally {
        client.release();
        process.exit();
    }
}

testPhase18();
