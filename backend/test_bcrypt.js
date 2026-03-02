const bcrypt = require('bcrypt');

const password = '18112003aA@myloveankyy';
const hash = '$2b$10$wZkQ9FpB/k6pXfX2sV/dJe1g15X0H.k9q3z3O9dJ3W9yUqH/bZfIe';

bcrypt.compare(password, hash).then(res => {
    console.log("Match:", res);
}).catch(err => {
    console.error("Error:", err);
});
