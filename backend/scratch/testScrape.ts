import { fetchWithFallback, extractTextFromHTML } from "../src/scrapers/fetchService";
import { extractFromDOM, extractWithRegex } from "../src/scrapers/extractorUtils";
import { browserPool } from "../src/scrapers/browserPool";

async function testScrape(url: string, name: string) {
    console.log(`\n--- Testing ${name} (${url}) ---`);
    const res = await fetchWithFallback(url, 30000);
    console.log(`Method: ${res.method}, Success: ${res.success}, HTML Length: ${res.html.length}`);
    
    if (res.success && res.html) {
        const domResults = extractFromDOM(res.html);
        console.log(`DOM Results:`, JSON.stringify(domResults.slice(0, 3), null, 2));

        const regexResults = extractWithRegex(res.html);
        console.log(`Regex Results:`, JSON.stringify(regexResults.slice(0, 3), null, 2));
    }
}

async function main() {
    await browserPool.init();
    await testScrape("https://shillongteercalculator.in", "Shillong Calculator");
    await testScrape("https://khanapara.com", "Khanapara");
    await browserPool.close();
}

main().catch(console.error);
