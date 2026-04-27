
const fs = require('fs');
const html = fs.readFileSync('shillong_ground_dump.html', 'utf8');

// Simple regex to find numbers after 25-04-2026
const match = html.match(/25-04-2026.*?(\d{2}).*?(\d{2})/s);
if (match) {
    console.log(`Found: FR=${match[1]}, SR=${match[2]}`);
} else {
    console.log('No numeric match for today.');
    const awaitedMatch = html.match(/25-04-2026.*?XX.*?XX/s);
    if (awaitedMatch) console.log('Found: Awaited (XX/XX)');
}

// Check other dates
['24-04-2026', '23-04-2026'].forEach(date => {
    const m = html.match(new RegExp(date + '.*?(\\d{2}).*?(\\d{2})', 's'));
    if (m) console.log(`${date}: FR=${m[1]}, SR=${m[2]}`);
});
