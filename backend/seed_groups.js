const db = require('./db');
require('dotenv').config();

async function seed() {
    try {
        await db.query(`
            INSERT INTO groups (name, short_description, description, icon_url, is_public) 
            VALUES 
            ('Official VIP', 'Premium members only', 'Exclusive Official Teer predictions and community chat.', 'shillong', true), 
            ('Shillong Masterminds', 'Public discussions', 'Share your hottest Shillong Teer numbers and daily targets.', 'khanapara', true)
        `);
        console.log('Groups seeded successfully');
        process.exit(0);
    } catch (e) {
        console.error('Error seeding groups:', e);
        process.exit(1);
    }
}

seed();
