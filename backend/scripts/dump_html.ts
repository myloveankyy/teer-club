import axios from 'axios';

async function main() {
    const url = 'https://shillongteerground.com/previous-results/';
    try {
        const response = await axios.get(url);
        console.log(response.data.substring(0, 10000)); // Show first 10k chars
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

main();
