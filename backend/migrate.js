const db = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration(filename) {
    const filePath = path.join(__dirname, 'migrations', filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split on semicolons, filter empty statements
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    let success = 0;
    let failed = 0;

    for (const stmt of statements) {
        const preview = stmt.substring(0, 80).replace(/\s+/g, ' ');
        try {
            await db.query(stmt);
            console.log(`  ✅ ${preview}...`);
            success++;
        } catch (err) {
            console.error(`  ❌ FAILED: ${preview}`);
            console.error(`     Reason: ${err.message}`);
            failed++;
        }
    }

    return { success, failed };
}

async function main() {
    const migrations = [
        'bank_and_withdrawal.sql',
        'gap_analysis_additions.sql',
        'fix_withdrawal_status.sql',
        'profile_enhancement.sql',
        'common_numbers.sql',
    ];

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const file of migrations) {
        console.log(`\n--- Running: ${file} ---`);
        const { success, failed } = await runMigration(file);
        totalSuccess += success;
        totalFailed += failed;
    }

    console.log(`\n=== Migration Complete: ${totalSuccess} succeeded, ${totalFailed} failed ===`);
    process.exit(totalFailed > 0 ? 1 : 0);
}

main();
