const bcrypt = require('bcrypt');
const fs = require('fs');

const password = '18112003aA@myloveankyy';
const freshHash = bcrypt.hashSync(password, 10);
console.log("FRESH_HASH=" + freshHash);
fs.writeFileSync('hash_out.txt', freshHash);
