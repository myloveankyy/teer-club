const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initDB() {
    try {
        console.log("Reading schema.sql...");
        const schemaString = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        console.log("Executing schema queries...");
        await db.query(schemaString);
        console.log("Database initialized with Phase 1 & 2 schema successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to initialize DB. It might be offline.", err.message);
        process.exit(1);
    }
}

initDB();
