import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    const url = 'https://shillongteerground.com/previous-results/page/2/';
    console.log(`Fetching ${url}...`);
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const links: any[] = [];

        $('a').each((_, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            if (href && (href.includes('shillong') || href.includes('202') || href.includes('result'))) {
                links.push({ text, href });
            }
        });

        console.log('Found interesting links:');
        console.log(JSON.stringify(links, null, 2));
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

main();
