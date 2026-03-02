const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const httpsAgent = new https.Agent({ family: 4 });

const URLS = {
    shillongApi: 'https://cdn.shillongteerground.com/teer/api/results/',
    khanapara: 'https://shillongteergrounds.in/khanapara-teer-result-list-previous-chart/',
    juwai: 'https://shillongteergrounds.in/juwai-teer-previous-result-list/'
};

// Standardize date to YYYY-MM-DD
function standardizeDate(dateStr) {
    if (!dateStr) return null;
    const clean = dateStr.trim().replace(/\./g, '-');
    const parts = clean.split('-');
    if (parts.length === 3) {
        if (parts[0].length === 2 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
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

// Extract embedded JSON format for Khanapara and Juwai
async function fetchAndParseHTML(url, gameName) {
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 25000
        });

        const $ = cheerio.load(html);
        let foundJson = '';

        $('script').each((i, el) => {
            const content = $(el).html();
            if (content && content.includes('const data = {')) {
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

        const results = [];
        if (foundJson) {
            const parsed = JSON.parse(foundJson);
            // Iterate over all years and months to flatten the data
            for (const year in parsed) {
                for (const month in parsed[year]) {
                    const days = parsed[year][month];
                    if (Array.isArray(days)) {
                        days.forEach(item => {
                            if (item.date) {
                                const formattedDate = standardizeDate(item.date);
                                if (formattedDate) {
                                    results.push({
                                        date: formattedDate,
                                        round1: cleanNumber(item.fr || item.F_R),
                                        round2: cleanNumber(item.sr || item.S_R)
                                    });
                                }
                            }
                        });
                    }
                }
            }
        }

        // Sort descending
        return results.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
        console.error(`Error scraping ${gameName}:`, e);
        return [];
    }
}

// Extract API format for Shillong
async function fetchShillongAPI() {
    try {
        const { data } = await axios.get(URLS.shillongApi, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 25000
        });
        if (!Array.isArray(data)) return [];
        return data.map(item => ({
            date: standardizeDate(item.date),
            round1: cleanNumber(item.first_round),
            round2: cleanNumber(item.second_round)
        })).filter(item => item.date);
    } catch (e) {
        console.error(`Error scraping Shillong API: ${e.message}`);
        return [];
    }
}

/**
 * Scrape Live Results (Top row of each source)
 * Expected by `/api/admin/results/scrape`
 */
async function scrapeTeerResults() {
    try {
        const shillongData = await fetchShillongAPI();
        const khanaparaData = await fetchAndParseHTML(URLS.khanapara, 'khanapara');
        const juwaiData = await fetchAndParseHTML(URLS.juwai, 'juwai');

        const shillongLive = shillongData[0] || { date: new Date().toISOString().split('T')[0], round1: null, round2: null };
        const targetDate = shillongLive.date;

        const khanaparaLive = khanaparaData.find(d => d.date === targetDate) || { date: targetDate, round1: null, round2: null };
        const juwaiLive = juwaiData.find(d => d.date === targetDate) || { date: targetDate, round1: null, round2: null };

        return {
            shillong: shillongLive,
            khanapara: khanaparaLive,
            juwai: juwaiLive
        };

    } catch (error) {
        console.error('Scraper Error (Live Multi):', error.message);
        return { error: 'Failed to fetch live results' };
    }
}

/**
 * Scrape Historical Results
 * Expected by seeder scripts or historical triggers
 */
async function scrapeTeerHistory() {
    try {
        const shillongData = await fetchShillongAPI();
        const khanaparaData = await fetchAndParseHTML(URLS.khanapara, 'khanapara');
        const juwaiData = await fetchAndParseHTML(URLS.juwai, 'juwai');

        // Merge all histories into a standard format sorted by Date
        // To accurately represent the merged format, we'll build a map of dates
        const dateMap = {};

        const addData = (dataArray, gameKey) => {
            dataArray.forEach(row => {
                if (!dateMap[row.date]) {
                    dateMap[row.date] = {
                        date: row.date,
                        shillong: { round1: null, round2: null },
                        khanapara: { round1: null, round2: null },
                        juwai: { round1: null, round2: null }
                    };
                }
                dateMap[row.date][gameKey] = { round1: row.round1, round2: row.round2 };
            });
        };

        addData(shillongData, 'shillong');
        addData(khanaparaData, 'khanapara');
        addData(juwaiData, 'juwai');

        const history = Object.values(dateMap);

        // Sort history by date descending (latest first)
        return history.sort((a, b) => new Date(b.date) - new Date(a.date));

    } catch (error) {
        console.error('Scraper Error (History Multi):', error.message);
        return [];
    }
}

module.exports = { scrapeTeerResults, scrapeTeerHistory };
