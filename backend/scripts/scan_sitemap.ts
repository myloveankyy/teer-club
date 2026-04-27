import axios from 'axios';
import { parseStringPromise } from 'xml2js';

async function main() {
    const url = 'https://shillongteerground.com/post-sitemap.xml';
    console.log(`Fetching sitemap: ${url}...`);
    try {
        const response = await axios.get(url);
        const result = await parseStringPromise(response.data);
        const urls = result.urlset.url.map((u: any) => u.loc[0]);

        console.log('Found URLs in sitemap:');
        const relevant = urls.filter((u: string) => u.includes('shillong') || u.includes('result'));
        console.log(JSON.stringify(relevant, null, 2));
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

main();
