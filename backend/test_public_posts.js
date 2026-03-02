const axios = require('axios');

async function testApi() {
    try {
        const res = await axios.get('http://localhost:5000/api/public/posts');
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.log('Error Status:', err.response?.status);
        console.log('Error Data:', err.response?.data);
        console.log('Error Message:', err.message);
    }
}

testApi();
