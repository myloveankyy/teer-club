const { scrapeTeerHistory } = require('./index');

async function debug() {
    console.log("Running scraper debug...");
    const history = await scrapeTeerHistory();
    console.log(`Total records found: ${history.length}`);

    if (history.length > 0) {
        console.log("First 5 records (should be latest):");
        console.log(JSON.stringify(history.slice(0, 5), null, 2));

        console.log("Last 5 records (should be oldest):");
        console.log(JSON.stringify(history.slice(-5), null, 2));
    } else {
        console.log("No records found.");
    }
}

debug();
