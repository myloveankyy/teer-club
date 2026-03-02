const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function extractData(url) {
    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
        const $ = cheerio.load(data);
        let foundJson = '';
        $('script').each((i, el) => {
            const content = $(el).html();
            if (content && content.includes('const data = {')) {
                // Extract the JSON object using regex or simple parsing
                const startIndex = content.indexOf('const data = {') + 'const data = '.length;
                let braceCount = 0;
                let endIndex = -1;
                for (let j = startIndex; j < content.length; j++) {
                    if (content[j] === '{') braceCount++;
                    if (content[j] === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            endIndex = j + 1;
                            break;
                        }
                    }
                }
                if (endIndex !== -1) {
                    foundJson = content.substring(startIndex, endIndex);
                }
            }
        });
        if (foundJson) {
            console.log("JSON Length:", foundJson.length);

            // Print a sample to understand the schema
            const parsed = JSON.parse(foundJson);
            console.log("Years available:", Object.keys(parsed));
            if (parsed['2026']) {
                console.log("Months in 2026:", Object.keys(parsed['2026']));
                if (parsed['2026']['02']) {
                    console.log("Sample day in 2026-02:", parsed['2026']['02'][0]);
                }
            }
        } else {
            console.log("No data found.");
        }
    } catch (e) {
        console.error("Error", e.message);
    }
}

extractData('https://shillongteergrounds.in/juwai-teer-previous-result-list/');
