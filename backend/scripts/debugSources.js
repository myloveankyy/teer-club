const { chromium } = require('playwright');

async function debug(url) {
    console.log(`\n🔍 Debugging URL: ${url}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const content = await page.content();
        console.log(`Content length: ${content.length}`);

        // Look for today's date
        const today = '25-04-2026';
        const altToday = '25/04/2026';
        const textualToday = '25 Apr';

        if (content.includes(today) || content.includes(altToday) || content.includes(textualToday)) {
            console.log('✅ Found TODAY (2026-04-25) in DOM!');
        } else {
            console.log('❌ TODAY NOT FOUND in DOM.');
        }

        // Capture tables
        const tables = await page.$$eval('table', (tabs) => tabs.map(t => t.innerText.substring(0, 500)));
        console.log(`Found ${tables.length} tables.`);
        tables.forEach((t, i) => console.log(`Table ${i}: ${t.replace(/\n/g, ' ')}`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await browser.close();
    }
}

async function run() {
    await debug('https://khanapara.com/');
    await debug('https://bhutandayteer.com/');
}

run();
