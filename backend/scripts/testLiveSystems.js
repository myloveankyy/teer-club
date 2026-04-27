const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/admin/cron';
const API_KEY = 'dev-key-123'; // Matches backend default

const client = axios.create({
    baseURL: API_BASE,
    headers: { 'X-API-Key': API_KEY }
});

async function test() {
    console.log('🚀 Testing Upgraded Live Result System...');

    try {
        // 1. Check Cron Status
        console.log('\n📊 1. Checking Cron Status...');
        const status = await client.get('/status');
        console.log('Jobs registered:', status.data.data.length);
        status.data.data.forEach(j => {
            console.log(` - ${j.displayName}: ${j.lastStatus || 'IDLE'} (Running: ${j.isRunning})`);
        });

        // 2. Trigger Single Scrape (Bhutan)
        console.log('\n🎯 2. Triggering Individual Scrape (Bhutan)...');
        try {
            const bhutanRes = await client.post('/trigger/Bhutan');
            console.log('Bhutan Result:', bhutanRes.data.success ? 'SUCCESS' : 'FAILED');
            console.log('Extracted Data:', bhutanRes.data.data);
        } catch (e) {
            console.log('Bhutan Trigger Error:', e.response?.data || e.message);
        }

        // 3. Trigger All
        console.log('\n🌍 3. Triggering Global Fetch...');
        try {
            const allRes = await client.post('/trigger-all');
            console.log('Global Trigger:', allRes.data.success ? 'SUCCESS' : 'FAILED');
        } catch (e) {
            console.log('Global Trigger Error:', e.response?.data || e.message);
        }

    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
}

test();
