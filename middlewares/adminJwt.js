const jwt = require('jsonwebtoken');

function userJwt(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Token is required" });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.secret);
        
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: "Access denied. You are not an admin." });
        }

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token has expired" });
        }
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = userJwt;
