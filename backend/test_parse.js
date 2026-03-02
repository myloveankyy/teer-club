const fs = require('fs');
const cheerio = require('cheerio');

const files = ['shillong.html', 'khanapara.html', 'juwai.html'];

files.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);

    console.log(`\n--- ${file} ---`);
    console.log(`Tables found: ${$('table').length}`);

    // Check forms/selects for year
    $('select').each((i, el) => {
        console.log(`Select found: class="${$(el).attr('class')}" id="${$(el).attr('id')}" name="${$(el).attr('name')}"`);
        $(el).find('option').each((j, opt) => {
            console.log(`  Option: val="${$(opt).attr('value')}" text="${$(opt).text()}"`);
        });
    });

    // Check first 2 rows of the first 2 tables
    $('table').slice(0, 2).each((i, table) => {
        console.log(`Table ${i + 1} Headers:`);
        $(table).find('th, td').slice(0, 5).each((j, cell) => {
            console.log(`  ${$(cell).text().trim()}`);
        });
    });
});
