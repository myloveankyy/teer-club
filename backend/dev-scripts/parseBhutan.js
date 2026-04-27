const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('bhutan.html', 'utf8');
const $ = cheerio.load(html);
$('table tr').slice(0, 5).each((i, row) => {
    let cells = $(row).find('td, th');
    let textOut = [];
    cells.each((j, cell) => {
        textOut.push($(cell).text().trim());
    });
    console.log(`[Row ${i}]`, textOut.join(' | '));
});
