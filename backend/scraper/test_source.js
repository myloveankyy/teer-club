const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.meghalayateer.com/';

async function testScrape() {
    try {
        console.log(`Fetching ${URL}...`);
        const res = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const html = res.data;

        const index2026 = html.indexOf('2026');
        if (index2026 !== -1) {
            console.log(`[SUCCESS] Found '2026' at index ${index2026}`);
            console.log("Context (surrounding 500 chars):");
            console.log(html.substring(index2026 - 250, index2026 + 250));
        } else {
            console.log(`[FAILURE] '2026' NOT FOUND`);
        }

        console.log('--- DIV ANALYSIS (looking for result structures) ---');
        // Try to find typical result container classes
        const potentialClasses = ['.result', '.table', '.row', '.col', '.card', '.list'];
        potentialClasses.forEach(cls => {
            const count = $(cls).length;
            if (count > 0) {
                console.log(`Found ${count} elements with class '${cls}'`);
                // Print first one
                console.log($(cls).first().text().substring(0, 100).replace(/\s+/g, ' ').trim());
            }
        });

    } catch (error) {
        console.error(`Error fetching ${URL}:`, error.message);
    }
}
testScrape();
