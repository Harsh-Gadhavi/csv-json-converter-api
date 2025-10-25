const express = require('express');
require('dotenv').config();

// Import all services
const pool = require('./config/database');
const csvParser = require('./parsers/csvParser');
const fileService = require('./services/fileService');
const dataService = require('./services/dataService');
const reportService = require('./services/reportService');

const app = express();
app.use(express.json());

/**
 * MAIN ENDPOINT: Process CSV file
 * POST /process-csv
 * 
 * Steps:
 * 1. Read CSV file from configured location
 * 2. Parse CSV to JSON (custom parser)
 * 3. Transform data to match DB schema
 * 4. Insert records into PostgreSQL
 * 5. Generate age distribution report
 */
app.post('/process-csv', async (req, res) => {
    console.log('\n' + '='.repeat(60));
    console.log('Starting CSV Processing Pipeline');
    console.log('='.repeat(60) + '\n');
    
    const startTime = Date.now();
    
    try {
        // Step 1: Read CSV file
        const csvPath = process.env.CSV_FILE_PATH;
        
        if (!csvPath) {
            return res.status(500).json({ 
                error: 'CSV_FILE_PATH not configured in .env file' 
            });
        }
        
        const exists = await fileService.fileExists(csvPath);
        if (!exists) {
            return res.status(404).json({ 
                error: `CSV file not found at: ${csvPath}` 
            });
        }
        
        const csvContent = await fileService.readCSV(csvPath);
        
        // Step 2: Parse CSV to JSON
        const parsedRecords = csvParser.parse(csvContent);
        
        if (parsedRecords.length === 0) {
            return res.status(400).json({ 
                error: 'No valid records found in CSV file' 
            });
        }
        
        // Step 3: Transform data for database
        const transformedRecords = dataService.transformForDB(parsedRecords);
        
        // Step 4: Insert into database (in batches for performance)
        const insertedCount = await dataService.insertBatch(pool, transformedRecords);
        
        // Step 5: Generate age distribution report
        const distribution = await reportService.generateAgeDistribution(pool);
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('='.repeat(60));
        console.log(`✓ Pipeline completed in ${duration} seconds`);
        console.log('='.repeat(60) + '\n');
        
        // Send success response
        res.json({
            success: true,
            message: 'CSV processed successfully',
            data: {
                recordsProcessed: insertedCount,
                duration: `${duration}s`,
                ageDistribution: distribution
            }
        });
        
    } catch (error) {
        console.error('\n✗ Error in processing pipeline:', error.message);
        console.error('='.repeat(60) + '\n');
        
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

/**
 * HEALTH CHECK ENDPOINT
 * GET /health
 * 
 * Checks:
 * - Server is running
 * - Database connection is active
 */
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        
        res.json({ 
            status: 'healthy',
            server: 'running',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'unhealthy',
            server: 'running',
            database: 'disconnected',
            error: error.message
        });
    }
});

/**
 * GET ALL USERS ENDPOINT (for testing/verification)
 * GET /users
 */
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id LIMIT 100');
        
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

/**
 * CLEAR DATABASE ENDPOINT (for testing)
 * DELETE /users
 * 
 * CAUTION: This deletes all records!
 */
app.delete('/users', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM users');
        
        console.log(`✓ Deleted ${result.rowCount} records from database`);
        
        res.json({
            success: true,
            message: `Deleted ${result.rowCount} records`,
            deletedCount: result.rowCount
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log(`  CSV to JSON Converter API`);
    console.log(`  Server running on: http://localhost:${PORT}`);
    console.log('='.repeat(60));
    console.log('\nAvailable Endpoints:');
    console.log(`  POST   http://localhost:${PORT}/process-csv  - Process CSV file`);
    console.log(`  GET    http://localhost:${PORT}/health       - Health check`);
    console.log(`  GET    http://localhost:${PORT}/users        - View users`);
    console.log(`  DELETE http://localhost:${PORT}/users        - Clear database`);
    console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    pool.end();
    process.exit(0);
});

module.exports = app;