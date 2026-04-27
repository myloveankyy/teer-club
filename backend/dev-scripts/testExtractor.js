const fs = require('fs');
const cheerio = require('cheerio');

// Simulate the logic in extractorUtils
const html = fs.readFileSync('bhutan.html', 'utf8');
const $ = cheerio.load(html);

const results = [];
$('table tr').each((_, el) => {
    const cells = $(el).find('td, th');
    if (cells.length < 3) return;

    let col1 = $(cells[1]).text().trim();
    let col2 = $(cells[2]).text().trim();
    let col3 = cells.length >= 4 ? $(cells[3]).text().trim() : "";
    let col4 = cells.length >= 5 ? $(cells[4]).text().trim() : "";

    let round1Text = col1;
    let round2Text = col2;
    let round3Text = col3;

    const isCityColumn = /^(bhutan|shillong|khanapara|juwai|meghalaya)$/i.test(col1.replace(/[^a-z]/ig, ''));
    if (isCityColumn) {
        round1Text = col2;
        round2Text = col3;
        round3Text = col4;
    }

    results.push({
        date: $(cells[0]).text().trim(),
        round1: round1Text,
        round2: round2Text,
        isCityDetected: isCityColumn
    });
});

console.log(results.slice(0, 5));
