const axios = require('axios');

async function fetchHtml() {
    try {
        const response = await axios.get('https://cdn.shillongteerground.com/teer/api/results/', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        console.log('API Response Status:', response.status);
        if (Array.isArray(response.data)) {
            console.log('Data is an Array. Length:', response.data.length);
            // Print first item to see structure
            console.log('First item:', JSON.stringify(response.data[0], null, 2));
        } else {
            console.log('Data is object:', JSON.stringify(response.data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fetchHtml();
