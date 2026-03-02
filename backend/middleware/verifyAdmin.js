const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

const verifyAdmin = (req, res, next) => {
    // Look for token in cookies or Authorization header
    const token = req.cookies?.admin_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Strict check: only the master administrative user
        if (decoded.username !== 'myloveankyy') {
            return res.status(403).json({ error: 'Invalid admin credentials.' });
        }

        req.admin = decoded;
        next();
    } catch (ex) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = verifyAdmin;
