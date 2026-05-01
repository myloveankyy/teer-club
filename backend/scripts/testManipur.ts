import { scrapeManipurLive } from "../src/scrapers/manipurScraper";
import * as fetchService from "../src/scrapers/fetchService";
import { logger } from "../src/utils/logger";

// Mock fetchWithFallback to return our controlled HTML
jest.mock("../src/scrapers/fetchService", () => ({
    fetchWithFallback: jest.fn()
}));

async function runTest() {
    console.log("--- TEST 1: Source has '0/0' ---");
    (fetchService.fetchWithFallback as any) = async () => {
        return {
            success: true,
            html: `
        <html>
          <body>
            <div class="result-box">
              <span>Manipur Result (Pending)</span>
              <div>0/0</div>
            </div>
          </body>
        </html>
      `
        };
    };

    const res1 = await scrapeManipurLive({ name: 'manipur', liveSourceUrl: 'http://test' });
    console.log("Result 1:", JSON.stringify(res1, null, 2));

    console.log("\n--- TEST 2: Source has valid data '45' and '82' ---");
    (fetchService.fetchWithFallback as any) = async () => {
        return {
            success: true,
            html: `
        <html>
          <body>
            <div class="result-box">
              <span>Manipur Day Result</span>
              <div><span>45</span> / <span>82</span></div>
            </div>
          </body>
        </html>
      `
        };
    };

    const res2 = await scrapeManipurLive({ name: 'manipur', liveSourceUrl: 'http://test' });
    console.log("Result 2:", JSON.stringify(res2, null, 2));
}

runTest().catch(console.error);
