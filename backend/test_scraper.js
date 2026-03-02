const axios = require('axios');
const cheerio = require('cheerio');

const URLS = {
    shillong: 'https://shillongteerground.com/previous-results/',
    khanapara: 'https://shillongteergrounds.in/khanapara-teer-result-list-previous-chart/',
    juwai: 'https://shillongteergrounds.in/juwai-teer-previous-result-list/'
};

// Standardize date from DD.MM.YYYY or DD-MM-YYYY to YYYY-MM-DD
function standardizeDate(dateStr) {
    if (!dateStr) return null;
    const clean = dateStr.trim().replace(/\./g, '-');
    const parts = clean.split('-');
    if (parts.length === 3) {
        // Handle DD-MM-YYYY
        if (parts[0].length === 2 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        // Handle YYYY-MM-DD (already formatted)
        if (parts[0].length === 4) return clean;
    }
    return null;
}

// Clean number: handle "xx", "*", "-", etc
function cleanNumber(val) {
    if (!val) return null;
    val = val.trim();
    if (val === '' || val === '-' || val === 'xx' || val === 'XX' || val === '*') return null;
    return val;
}

async function fetchAndParse(url, gameName) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const results = [];

        $('tr').each((i, row) => {
            const tds = $(row).find('td');
            if (tds.length >= 3) {
                const dateRaw = $(tds[0]).text().trim();
                const r1Raw = $(tds[1]).text().trim();
                const r2Raw = $(tds[2]).text().trim();

                const formattedDate = standardizeDate(dateRaw);
                if (formattedDate) {
                    results.push({
                        date: formattedDate,
                        round1: cleanNumber(r1Raw),
                        round2: cleanNumber(r2Raw)
                    });
                }
            }
        });
        return results;
    } catch (e) {
        console.error(`Error scraping ${gameName}: ${e.message}`);
        return [];
    }
}

async function testAll() {
    console.log("Scraping Shillong...");
    const sh = await fetchAndParse(URLS.shillong, 'shillong');
    console.log(`Shillong total: ${sh.length}, Last latest:`, sh[0]);

    console.log("Scraping Khanapara...");
    const kh = await fetchAndParse(URLS.khanapara, 'khanapara');
    console.log(`Khanapara total: ${kh.length}, Last latest:`, kh[0]);

    console.log("Scraping Juwai...");
    const ju = await fetchAndParse(URLS.juwai, 'juwai');
    console.log(`Juwai total: ${ju.length}, Last latest:`, ju[0]);
}

testAll();
