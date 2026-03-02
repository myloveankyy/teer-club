const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('khanapara.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Script Tags ---');
$('script').each((i, el) => {
    const src = $(el).attr('src');
    if (src) {
        console.log(`SRC: ${src}`);
    } else {
        const text = $(el).html() || '';
        if (text.includes('2019') || text.includes('fetch') || text.includes('ajx') || text.includes('var') || text.includes('const')) {
            console.log(`INLINE SCRIPT (len ${text.length}):\n${text.substring(0, 500)}...\n---`);
        }
    }
});
