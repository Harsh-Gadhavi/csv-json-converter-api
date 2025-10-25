// generate-large-csv.js
// Purpose: Generate a CSV file with 50,000+ records for testing

const fs = require('fs');
const path = require('path');

// Sample data pools
const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan',
    'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advait', 'Pranav', 'Dhruv',
    'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Kiara', 'Anika', 'Myra', 'Sara',
    'Navya', 'Aarohi', 'Pari', 'Angel', 'Kavya', 'Avni', 'Prisha'
];

const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Nair',
    'Iyer', 'Joshi', 'Rao', 'Agarwal', 'Chopra', 'Desai', 'Mehta', 'Khan',
    'Malhotra', 'Bose', 'Das', 'Kapoor', 'Banerjee', 'Mishra', 'Pandey'
];

const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Chandigarh'
];

const states = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu',
    'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Kerala'
];

const streets = [
    'MG Road', 'Park Street', 'Linking Road', 'FC Road', 'Brigade Road',
    'Commercial Street', 'Marine Drive', 'Residency Road', 'Nehru Place'
];

const genders = ['male', 'female', 'other'];

// Random number generators
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generatePhoneNumber() {
    return '9' + String(randomInt(100000000, 999999999));
}

function generateRecord(index) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const age = randomInt(15, 75); // Varied age distribution
    const city = randomElement(cities);
    const state = randomElement(states);
    const street = randomElement(streets);
    const gender = randomElement(genders);
    const phone = generatePhoneNumber();
    
    return {
        firstName,
        lastName,
        age,
        line1: `${randomInt(1, 999)}-${randomInt(1, 9)} ${street}`,
        line2: `Building ${randomInt(1, 50)}`,
        city,
        state,
        gender,
        phone
    };
}

// Main generation function
function generateCSV(numRecords, outputPath) {
    console.log(`Generating CSV with ${numRecords} records...`);
    console.log(`Output: ${outputPath}\n`);
    
    const startTime = Date.now();
    
    // Write header
    const header = 'name.firstName,name.lastName,age,address.line1,address.line2,address.city,address.state,gender,phone\n';
    fs.writeFileSync(outputPath, header);
    
    // Write records in chunks for memory efficiency
    const chunkSize = 10000;
    let processed = 0;
    
    for (let i = 0; i < numRecords; i += chunkSize) {
        const chunk = [];
        const recordsInChunk = Math.min(chunkSize, numRecords - i);
        
        for (let j = 0; j < recordsInChunk; j++) {
            const record = generateRecord(i + j);
            const line = [
                record.firstName,
                record.lastName,
                record.age,
                record.line1,
                record.line2,
                record.city,
                record.state,
                record.gender,
                record.phone
            ].join(',');
            
            chunk.push(line);
        }
        
        fs.appendFileSync(outputPath, chunk.join('\n') + '\n');
        processed += recordsInChunk;
        
        const progress = ((processed / numRecords) * 100).toFixed(1);
        console.log(`Progress: ${progress}% (${processed.toLocaleString()} / ${numRecords.toLocaleString()} records)`);
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    const stats = fs.statSync(outputPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ CSV generation completed!');
    console.log('='.repeat(60));
    console.log(`Records: ${numRecords.toLocaleString()}`);
    console.log(`File size: ${fileSizeMB} MB`);
    console.log(`Duration: ${duration} seconds`);
    console.log(`Location: ${outputPath}`);
    console.log('='.repeat(60));
}

// Run generator
const numRecords = 50000; // Change this number as needed
const outputPath = path.join(__dirname, 'data', 'large-input.csv');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

generateCSV(numRecords, outputPath);