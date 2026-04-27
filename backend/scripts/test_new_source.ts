import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    const url = 'https://teerresults.net/shillong-teer-previous-result/';
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        console.log('Title:', $('title').text());

        // Find tables
        $('table').each((i, el) => {
            console.log(`\nTable ${i + 1}:`);
            $(el).find('tr').slice(0, 5).each((j, tr) => {
                const cells = $(tr).find('td, th').map((_, cell) => $(cell).text().trim()).get();
                console.log(`Row ${j + 1}:`, cells.join(' | '));
            });
        });

        // Look for next page links
        console.log('\nPagination links:');
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            if (href && (href.includes('page') || /^\d+$/.test(text))) {
                console.log(`[${text}] -> ${href}`);
            }
        });
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

main();
