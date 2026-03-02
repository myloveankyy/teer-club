const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('18112003aA@myloveankyy', 10);
console.log(hash);
