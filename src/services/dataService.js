class DataService {
    
    /**
     * Transforms parsed JSON records to database schema
     * 
     * Database Schema:
     * - name (varchar): firstName + lastName combined
     * - age (int4): Direct mapping
     * - address (jsonb): All address.* properties
     * - additional_info (jsonb): All other properties
     * 
     * @param {Array} records - Parsed JSON records
     * @returns {Array} Transformed records ready for database
     */
    transformForDB(records) {
        console.log('Transforming data for database insertion...');
        
        const transformed = records.map((record, index) => {
            // Validate mandatory fields
            if (!record.name || !record.name.firstName || !record.name.lastName) {
                throw new Error(`Row ${index + 2}: Missing mandatory field 'name.firstName' or 'name.lastName'`);
            }
            
            if (!record.age) {
                throw new Error(`Row ${index + 2}: Missing mandatory field 'age'`);
            }
            
            // Build transformed record
            const result = {
                name: `${record.name.firstName} ${record.name.lastName}`,
                age: parseInt(record.age),
                address: null,
                additional_info: {}
            };
            
            // Handle address object
            if (record.address && typeof record.address === 'object') {
                result.address = record.address;
            }
            
            // Collect all other properties into additional_info
            for (const key in record) {
                if (key !== 'name' && key !== 'age' && key !== 'address') {
                    result.additional_info[key] = record[key];
                }
            }
            
            // Set additional_info to null if empty
            if (Object.keys(result.additional_info).length === 0) {
                result.additional_info = null;
            }
            
            return result;
        });
        
        console.log(`✓ Transformed ${transformed.length} records`);
        return transformed;
    }
    
    /**
     * Inserts records in batches for performance
     * Handles 50,000+ records efficiently by batching
     * 
     * @param {Pool} pool - PostgreSQL connection pool
     * @param {Array} records - Transformed records
     * @param {number} batchSize - Number of records per batch (default: 1000)
     * @returns {Promise<number>} Total number of inserted records
     */
    async insertBatch(pool, records, batchSize = 1000) {
        console.log(`Starting batch insert (${records.length} records, batch size: ${batchSize})...`);
        
        let totalInserted = 0;
        const totalBatches = Math.ceil(records.length / batchSize);
        
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            
            // Build parameterized query for batch
            const values = [];
            const placeholders = [];
            
            batch.forEach((record, idx) => {
                const offset = idx * 4; // 4 columns per record
                placeholders.push(
                    `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`
                );
                
                values.push(
                    record.name,
                    record.age,
                    record.address ? JSON.stringify(record.address) : null,
                    record.additional_info ? JSON.stringify(record.additional_info) : null
                );
            });
            
            // Single query for entire batch
            const query = `
                INSERT INTO users (name, age, address, additional_info)
                VALUES ${placeholders.join(', ')}
                RETURNING id
            `;
            
            try {
                const result = await pool.query(query, values);
                totalInserted += result.rowCount;
                console.log(`  ✓ Batch ${batchNumber}/${totalBatches}: Inserted ${result.rowCount} records`);
            } catch (error) {
                console.error(`  ✗ Batch ${batchNumber} failed:`, error.message);
                throw error;
            }
        }
        
        console.log(`✓ Total inserted: ${totalInserted} records`);
        return totalInserted;
    }
}

module.exports = new DataService();
