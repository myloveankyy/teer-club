const fs = require('fs');
const cheerio = require('cheerio');

const files = ['khanapara.html', 'juwai.html'];

files.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);

    console.log(`\n--- ${file} ---`);
    console.log(`Total <tr> tags: ${$('tr').length}`);

    // Print the dates from the first 5 and last 5 rows to see the range
    const rows = $('tr').toArray();
    console.log("First 5 dates:");
    rows.slice(1, 6).forEach(row => { // skip header
        console.log($(row).find('td').first().text().trim());
    });
    console.log("Last 5 dates:");
    rows.slice(-5).forEach(row => {
        console.log($(row).find('td').first().text().trim());
    });
});
