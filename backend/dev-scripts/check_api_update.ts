import axios from 'axios';

async function checkApi() {
    try {
        const response = await axios.get('http://localhost:3001/api/results/today');
        console.log('API Status:', response.data.success);
        response.data.data.games.forEach((game: any) => {
            console.log(`Game: ${game.name}, Prediction: ${!!game.prediction}`);
        });
    } catch (err: any) {
        console.error('API Check Failed:', err.message);
    }
}

checkApi();
