const axios = require('axios');
const fs = require('fs');

async function testScrape() {
    try {
        const urls = [
            { name: 'shillong', url: 'https://shillongteerground.com/previous-results/' },
            { name: 'khanapara', url: 'https://shillongteergrounds.in/khanapara-teer-result-list-previous-chart/' },
            { name: 'juwai', url: 'https://shillongteergrounds.in/juwai-teer-previous-result-list/' }
        ];

        for (const item of urls) {
            console.log(`Fetching ${item.name}...`);
            const { data } = await axios.get(item.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            fs.writeFileSync(`${item.name}.html`, data);
            console.log(`Saved ${item.name}.html`);
        }
    } catch (e) {
        console.error(e);
    }
}
testScrape();
