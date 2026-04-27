import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    const url = 'https://teerresults.net/shillong-teer-previous-result/';
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        console.log('Total tables:', $('table').length);

        const dates: string[] = [];
        $('table tr').each((_, tr) => {
            const cells = $(tr).find('td, th');
            if (cells.length >= 3) {
                const date = $(cells[0]).text().trim();
                if (date.match(/\d{2}-\d{2}-\d{4}/)) {
                    dates.push(date);
                }
            }
        });

        console.log('Total date rows:', dates.length);
        if (dates.length > 0) {
            console.log('Newest date found:', dates[0]);
            console.log('Oldest date found:', dates[dates.length - 1]);
        }
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

main();
