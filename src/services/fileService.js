const fs = require('fs').promises;
const path = require('path');

class FileService {
    /**
     * Reads CSV file from given path
     * 
     * @param {string} filePath - Path to CSV file
     * @returns {Promise<string>} File content as string
     */
    async readCSV(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            console.log(`Reading CSV from: ${absolutePath}`);
            
            const content = await fs.readFile(absolutePath, 'utf-8');
            
            if (!content || content.trim().length === 0) {
                throw new Error('CSV file is empty');
            }
            
            console.log(`✓ File read successfully (${content.length} characters)`);
            return content;
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`File not found: ${filePath}`);
            }
            throw new Error(`Failed to read CSV file: ${error.message}`);
        }
    }
    
    /**
     * Checks if file exists at given path
     * 
     * @param {string} filePath - Path to check
     * @returns {Promise<boolean>} True if file exists
     */
    async fileExists(filePath) {
        try {
            await fs.access(path.resolve(filePath));
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = new FileService();