const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Ensure this path points to the correct db.js file

// Middleware to authenticate using JWT
const authenticate = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;

        // Optional user existence check
        const query = 'SELECT * FROM users WHERE id = ?';
        const [results] = await db.query(query, [req.userId]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        next(); // User is authenticated, proceed to next middleware or route handler
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(401).json({ message: 'Failed to authenticate token' });
    }
};

// Middleware to check if the user has the required role
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (roles.length && !roles.includes(req.userRole)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next(); // User has required role, proceed to next middleware or route handler
    };
};

// Optional: Middleware for employee access without authentication
const employeeAccess = (req, res, next) => {
    next(); // Allow access for employees to submit forms
};

module.exports = { authenticate, authorize, employeeAccess };
