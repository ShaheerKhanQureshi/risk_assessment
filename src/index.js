const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companies');
const dashboardRoutes = require('./routes/dashboard');
const assessmentRoutes = require('./routes/assessmentRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// // Initialize database connection
// db.connect(err => {
//     if (err) {
//         logger.error('Database connection error:', err);
//         process.exit(1); // Exit if DB connection fails
//     }
//     logger.info('Connected to MySQL database.');
// });

// Security middleware
app.use(helmet());

// Rate limiting to prevent abuse
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Route definitions
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/admin', adminRoutes);

// Basic health check route
app.get('/', (req, res) => {
    res.json({
        message: 'Health Risk Assessment API is running',
        dbStatus: db.connection ? 'Connected' : 'Disconnected',
    });
});

// Error handling middleware for better debugging
app.use((err, req, res, next) => {
    logger.error('Error stack:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

// Start the server
const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
        logger.info('Closed all connections');
        process.exit(0);
    });
});

module.exports = app;
