const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool for efficient database operations
// Pool reuses connections instead of creating new ones for each query
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20, // Maximum 20 concurrent connections
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Wait 2 seconds for connection
});

// Test connection on startup
pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected database error', err);
    process.exit(-1);
});

module.exports = pool;