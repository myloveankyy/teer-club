const axios = require('axios');

async function test() {
    try {
        console.log('Testing /api/results/latest...');
        const start = Date.now();
        const res = await axios.get('http://127.0.0.1:5000/api/results/latest', { timeout: 40000 });
        console.log('Response status:', res.status);
        console.log('Response body:', res.data);
    } catch (err) {
        console.error('Test Failed:', err.message);
        if (err.response) {
            console.log('Error status:', err.response.status);
            console.log('Error data:', err.response.data);
        }
    }
}

test();
