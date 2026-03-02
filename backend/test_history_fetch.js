const { scrapeTeerHistory } = require('./scraper');

async function testHistory() {
    console.log('Fetching history from new API source...');
    const history = await scrapeTeerHistory();
    console.log('History items fetched:', history.length);

    if (history.length > 0) {
        console.log('First 3 items (Latest):');
        console.log(JSON.stringify(history.slice(0, 3), null, 2));

        console.log('\nLast 3 items (Oldest):');
        console.log(JSON.stringify(history.slice(-3), null, 2));
    } else {
        console.log('No history fetched!');
    }
}

testHistory();
