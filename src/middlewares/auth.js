const jwt = require("jsonwebtoken");
const logger = require("../utils/logger"); // Assuming a logging utility is available

// Middleware to authenticate using JWT and check for specific roles
const authenticate = (requiredRole = null) => {
    return (req, res, next) => {
        if (!req.headers || !req.headers["authorization"]) {
            logger.warn("Authentication failed: No authorization header found");
            return res.status(401).json({ message: "No authorization header provided" });
        }

        const token = req.headers["authorization"]?.split(" ")[1];

        if (!token) {
            logger.warn("Authentication failed: No token provided");
            return res.status(401).json({ message: "No token provided" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                const errorMessage =
                    err.name === "JsonWebTokenError"
                        ? "Invalid token"
                        : err.name === "TokenExpiredError"
                        ? "Token has expired"
                        : "Failed to authenticate token";

                logger.warn(`Authentication failed: ${errorMessage}`);
                return res.status(401).json({ message: errorMessage });
            }

            req.user = { id: decoded.id, role: decoded.role };

            // Check if a specific role is required and user has that role
            if (requiredRole && decoded.role !== requiredRole) {
                logger.warn(`Access denied for user ${decoded.id}: insufficient permissions`);
                return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            }

            next(); // Continue to the next middleware or route
        });
    };
};



// Middleware to check if the user has the required role(s)
const hasRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            logger.warn(`Access denied for user ${req.user ? req.user.id : "unknown"}: insufficient permissions`);
            return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        }
        next();
    };
};

// Admin-specific middleware using the hasRole function
const isAdmin = hasRole(["admin"]);

// Middleware for employee access to forms (no token required)
const employeeAccess = (req, res, next) => {
    // This can be an open access route for employees to submit forms
    next();
};

module.exports = { authenticate, isAdmin, hasRole, employeeAccess };
