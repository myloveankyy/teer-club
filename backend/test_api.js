const http = require('http');
console.log("Testing API...");
http.get('http://localhost:5000/api/results/latest', (res) => {
    console.log('Status:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Body:', data));
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
