class CSVParser {
    
    /**
     * Parses a single CSV line respecting quoted values
     * Handles cases like: "value, with comma", normal value
     * 
     * Example: 'John,"Doe, Jr.",30' => ['John', 'Doe, Jr.', '30']
     */
    parseLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                // Toggle quote state
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                // Only split on commas outside quotes
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        // Push last value
        values.push(current.trim());
        return values;
    }
    
    /**
     * Converts dot notation string to nested object
     * 
     * Example: 
     * buildNestedObject('name.firstName', 'John')
     * Returns: { name: { firstName: 'John' } }
     */
    buildNestedObject(key, value) {
        const keys = key.split('.');
        const result = {};
        
        let current = result;
        
        // Build nested structure
        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = current[keys[i]] || {};
            current = current[keys[i]];
        }
        
        // Set final value
        current[keys[keys.length - 1]] = value;
        return result;
    }
    
    /**
     * Deep merge two objects
     * Used to combine multiple nested properties
     * 
     * Example:
     * mergeDeep({ name: { first: 'John' } }, { name: { last: 'Doe' } })
     * Returns: { name: { first: 'John', last: 'Doe' } }
     */
    mergeDeep(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                this.mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }
    
    /**
     * Main parse function
     * Converts entire CSV content to array of JSON objects
     * 
     * @param {string} csvContent - Complete CSV file content
     * @returns {Array} Array of parsed objects
     */
    parse(csvContent) {
        // Split into lines and remove empty lines
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }
        
        // First line is headers
        const headers = this.parseLine(lines[0]).map(h => h.trim());
        
        // Parse each data row
        const records = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseLine(lines[i]);
            
            // Validate column count matches headers
            if (values.length !== headers.length) {
                console.warn(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}. Skipping.`);
                continue;
            }
            
            // Build object for this row
            const record = {};
            
            for (let j = 0; j < headers.length; j++) {
                const header = headers[j];
                const value = values[j];
                
                // Convert dot notation to nested object
                const nestedObj = this.buildNestedObject(header, value);
                
                // Merge into main record
                this.mergeDeep(record, nestedObj);
            }
            
            records.push(record);
        }
        
        console.log(`✓ Successfully parsed ${records.length} records from CSV`);
        return records;
    }
}

module.exports = new CSVParser();