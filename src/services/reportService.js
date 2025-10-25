class ReportService {
    
    /**
     * Generates age distribution report from database
     * Prints formatted report to console
     * 
     * Age Groups:
     * - < 20
     * - 20 to 40
     * - 40 to 60
     * - > 60
     * 
     * @param {Pool} pool - PostgreSQL connection pool
     * @returns {Promise<Object>} Distribution percentages
     */
    async generateAgeDistribution(pool) {
        console.log('\nGenerating age distribution report...');
        
        try {
            // Fetch all ages from database
            const result = await pool.query('SELECT age FROM users ORDER BY age');
            const ages = result.rows.map(row => row.age);
            
            if (ages.length === 0) {
                console.log('⚠ No data available for age distribution');
                return null;
            }
            
            // Initialize age categories
            const categories = {
                'under20': 0,
                '20to40': 0,
                '40to60': 0,
                'over60': 0
            };
            
            // Categorize each age
            ages.forEach(age => {
                if (age < 20) {
                    categories.under20++;
                } else if (age >= 20 && age < 40) {
                    categories['20to40']++;
                } else if (age >= 40 && age < 60) {
                    categories['40to60']++;
                } else {
                    categories.over60++;
                }
            });
            
            // Calculate percentages
            const total = ages.length;
            const distribution = {
                '< 20': ((categories.under20 / total) * 100).toFixed(2),
                '20 to 40': ((categories['20to40'] / total) * 100).toFixed(2),
                '40 to 60': ((categories['40to60'] / total) * 100).toFixed(2),
                '> 60': ((categories.over60 / total) * 100).toFixed(2)
            };
            
            // Print formatted report
            console.log('\n' + '='.repeat(60));
            console.log('           AGE DISTRIBUTION REPORT');
            console.log('='.repeat(60));
            console.log('Age-Group                    % Distribution');
            console.log('-'.repeat(60));
            
            Object.entries(distribution).forEach(([ageGroup, percentage]) => {
                const padding = ' '.repeat(28 - ageGroup.length);
                console.log(`${ageGroup}${padding}${percentage}%`);
            });
            
            console.log('-'.repeat(60));
            console.log(`Total Users: ${total}`);
            console.log('='.repeat(60) + '\n');
            
            return distribution;
            
        } catch (error) {
            console.error('Error generating age distribution:', error.message);
            throw error;
        }
    }
}

module.exports = new ReportService();