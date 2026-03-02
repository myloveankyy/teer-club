const { scrapeTeerResultsLine, scrapeTeerHistory, scrapeTeerResults } = require('./scraper/index.js');

async function run() {
    console.log("Testing live mult-scrape...");
    const live = await scrapeTeerResults();
    console.log(JSON.stringify(live, null, 2));

    console.log("\nTesting history slice...");
    const hist = await scrapeTeerHistory();
    console.log(JSON.stringify(hist.slice(0, 3), null, 2));
}

run();
