// src/config/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection to the database with promise support
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'risk_assessment',
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on your expected load
    queueLimit: 0
});

// Log successful connection
db.getConnection()
    .then(() => {
        console.log('Connected to MySQL database.');
    })
    .catch((err) => {
        console.error('Error connecting to MySQL database:', err);
        process.exit(1);
    });

module.exports = db;
