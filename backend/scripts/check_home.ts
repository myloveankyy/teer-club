import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    const url = 'https://shillongteerground.com/';
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        console.log('Page Title:', $('title').text());

        // Look for any dates on the home page
        const text = $('body').text();
        const dateMatches = text.match(/\d{2}-\d{2}-\d{4}/g);
        console.log('Dates found on home page:', dateMatches?.slice(0, 5));

        // Look for links that might lead to archives
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            if (href && (href.includes('202') || href.includes('result') || href.includes('history'))) {
                console.log(`Link: [${text}] -> ${href}`);
            }
        });
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

main();
