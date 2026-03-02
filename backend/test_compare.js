const bcrypt = require('bcrypt');

const password = '18112003aA@myloveankyy';
const hash = '$2b$10$oRLvbvZv4sqjJPzGb5.GJOBN4V7bElGBJz82AViEC/Yq7IXXKQnUXW'; // I might have copied it wrong or it got truncated?

async function test() {
    console.log("Password:", password);
    console.log("Hash:", hash);
    const match = await bcrypt.compare(password, hash);
    console.log("Match:", match);

    // Let's generate a fresh hash and test immediately
    const freshHash = bcrypt.hashSync(password, 10);
    console.log("Fresh Hash:", freshHash);
    const freshMatch = await bcrypt.compare(password, freshHash);
    console.log("Fresh Match:", freshMatch);
}

test();
