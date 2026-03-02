const { scrapeTeerHistory } = require('./scraper');

async function test() {
    console.log('Fetching history...');
    try {
        const history = await scrapeTeerHistory();
        console.log('Type of history:', typeof history);
        console.log('Is array:', Array.isArray(history));
        console.log('Length:', history.length);
        console.log('First item:', history[0]);
        console.log('Full history stringified:', JSON.stringify(history).substring(0, 100));
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
