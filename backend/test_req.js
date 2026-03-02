const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a mock token for user 1
const token = jwt.sign({ id: 1, username: 'testuser' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

async function testEndpoint() {
    try {
        console.log("Testing GET /api/groups/1...");
        const res = await axios.get('http://localhost:5000/api/groups/1', {
            headers: {
                Cookie: `token=\${token}`
            }
        });
        console.log("Success:", res.data);
    } catch (err) {
        if (err.response) {
            console.error("Error Response:", err.response.status, err.response.data);
        } else {
            console.error("Error:", err.message);
        }
    }
}
testEndpoint();
