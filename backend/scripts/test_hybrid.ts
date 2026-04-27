import { scrapeWithHybrid } from '../src/scrapers/hybridEngine';
import { ScrapeConfig } from '../src/types/scraper';

async function main() {
    const config: ScrapeConfig = {
        url: 'https://teerresults.net/shillong-teer-previous-result/',
        gameId: 'test-id',
        gameName: 'Shillong',
        deep: true,
        useAI: false,
        maxPagesLimit: 2,
        timeout: 60000,
        chunkSize: 120000,
        stopOnNoNewData: false,
        maxConsecutiveEmpty: 3,
        detectApiEndpoints: false,
        retryCount: 1
    };

    console.log('Starting hybrid scrape test...');
    const result = await scrapeWithHybrid(config);

    console.log('Method used:', result.method);
    console.log('Total results found:', result.results.length);
    if (result.results.length > 0) {
        console.log('Newest result:', result.results[0]);
        console.log('Oldest result:', result.results[result.results.length - 1]);
    }

    // console.log('Logs:', result.logs.join('\n'));
}

main().catch(err => console.error(err));
