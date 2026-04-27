
const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('shillong_ground_dump.html', 'utf8');
const $ = cheerio.load(html);
const text = $('#content').text().trim().replace(/\s+/g, ' ');
console.log('EXTRACTED_CONTENT:', text);
