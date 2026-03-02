require('dotenv').config();
const db = require('./db');
const { scrapeTeerHistory } = require('./scraper/index');

async function seed() {
    try {
        console.log("Fetching all historical records. This might take a minute...");
        const history = await scrapeTeerHistory();
        console.log(`Fetched ${history.length} records. Uploading to Neon DB...`);

        let inserted = 0;
        let updated = 0;

        for (const record of history) {
            const { date, shillong, khanapara, juwai } = record;

            const res = await db.query(`
                INSERT INTO results (date, round1, round2, khanapara_r1, khanapara_r2, juwai_r1, juwai_r2, source, verified)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'Historical_Scrape', true)
                ON CONFLICT (date) DO UPDATE 
                SET round1 = EXCLUDED.round1, round2 = EXCLUDED.round2,
                    khanapara_r1 = EXCLUDED.khanapara_r1, khanapara_r2 = EXCLUDED.khanapara_r2,
                    juwai_r1 = EXCLUDED.juwai_r1, juwai_r2 = EXCLUDED.juwai_r2,
                    source = 'Historical_Scrape_Updated'
                RETURNING (xmax = 0) AS inserted;
            `, [
                date,
                shillong.round1, shillong.round2,
                khanapara.round1, khanapara.round2,
                juwai.round1, juwai.round2
            ]);

            if (res.rows[0].inserted) {
                inserted++;
            } else {
                updated++;
            }

            if ((inserted + updated) % 200 === 0) {
                console.log(`Processed ${inserted + updated} records...`);
            }
        }

        console.log(`\nDone! Inserted: ${inserted}, Updated: ${updated} out of ${history.length} total rows.`);
    } catch (err) {
        console.error("Seeding Error:", err);
    } finally {
        process.exit();
    }
}

seed();
