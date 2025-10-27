# CSV to JSON Converter API

A Node.js application that converts CSV files to JSON and stores data in PostgreSQL database with age distribution reporting.

## 🎯 Features

- ✅ Custom CSV parser (no external parsing libraries)
- ✅ Handles nested properties using dot notation (`name.firstName` → `{name: {firstName: value}}`)
- ✅ PostgreSQL database integration with JSONB support
- ✅ Batch inserts for optimal performance (handles 50,000+ records)
- ✅ Age distribution report generation
- ✅ RESTful API endpoints

## 📋 Requirements

- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- npm or yarn

## 🚀 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd csv-api-project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create database and table:

```sql
-- Create database
CREATE DATABASE csv_converter;

-- Connect to database and create table
CREATE TABLE public.users (
    id serial4 NOT NULL PRIMARY KEY,
    name varchar NOT NULL,
    age int4 NOT NULL,
    address jsonb NULL,
    additional_info jsonb NULL
);
```

### 4. Environment Configuration

Create `.env` file in root directory:

```env
PORT=3000
CSV_FILE_PATH=./data/input.csv
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=csv_converter
```

### 5. Prepare CSV File

Place your CSV file in the `data/` directory. The CSV must have mandatory fields:
- `name.firstName`
- `name.lastName`
- `age`

Example CSV format:

```csv
name.firstName,name.lastName,age,address.line1,address.city,address.state,gender
John,Doe,30,123 Main St,New York,NY,male
Jane,Smith,25,456 Oak Ave,Los Angeles,CA,female
```

## 📁 Project Structure

```
csv-api-project/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection pool
│   ├── parsers/
│   │   └── csvParser.js         # Custom CSV parser
│   ├── services/
│   │   ├── fileService.js       # File operations
│   │   ├── dataService.js       # Data transformation & batch insert
│   │   └── reportService.js     # Age distribution report
│   └── app.js                   # Main Express application
├── data/
│   └── input.csv                # CSV input files
├── .env                         # Environment variables
├── generate-large-csv.js        # Utility to generate test data
├── package.json
└── README.md
```

## 🎮 Usage

### Start Server

```bash
npm start
```

Server starts on `http://localhost:3000`

### API Endpoints

#### 1. Process CSV File

```bash
POST /process-csv
```

Processes the CSV file specified in `.env`, inserts records into database, and generates age distribution report.

**Example:**
```bash
curl -X POST http://localhost:3000/process-csv
```

**Response:**
```json
{
  "success": true,
  "message": "CSV processed successfully",
  "data": {
    "recordsProcessed": 50000,
    "duration": "15.23s",
    "ageDistribution": {
      "< 20": "8.50",
      "20 to 40": "32.40",
      "40 to 60": "33.10",
      "> 60": "26.00"
    }
  }
}
```

#### 2. Health Check

```bash
GET /health
```

Checks server and database connection status.

**Example:**
```bash
curl http://localhost:3000/health
```

#### 3. Get Users

```bash
GET /users
```

Retrieves users from database (limit 100).

**Example:**
```bash
curl http://localhost:3000/users
```

#### 4. Clear Database

```bash
DELETE /users
```

Deletes all records from users table.

**Example:**
```bash
curl -X DELETE http://localhost:3000/users
```

## 🧪 Testing with Large Files

Generate a test CSV with 50,000 records:

```bash
node generate-large-csv.js
```

This creates `data/large-input.csv`. Update `.env` to use this file:

```env
CSV_FILE_PATH=./data/large-input.csv
```

## 🏗️ Technical Implementation

### Custom CSV Parser

The parser handles:
- Quoted values containing commas: `"value, with comma"`
- Nested properties: `address.city` → `{address: {city: "value"}}`
- Large files (50,000+ records)
- Malformed rows (skips with warning)

### Database Schema Mapping

| CSV Fields | Database Column | Type | Description |
|------------|----------------|------|-------------|
| `name.firstName` + `name.lastName` | `name` | varchar | Combined full name |
| `age` | `age` | int4 | User age |
| `address.*` | `address` | jsonb | All address properties |
| Other fields | `additional_info` | jsonb | Remaining properties |

### Performance Optimizations

1. **Batch Inserts**: Inserts 1,000 records per query instead of individual inserts
2. **Connection Pooling**: Reuses database connections (max 20 concurrent)
3. **Chunked Processing**: Handles large files without loading entire content in memory

### Age Distribution

Calculates percentage distribution across four age groups:
- **< 20**: Under 20 years
- **20 to 40**: 20 to 39 years
- **40 to 60**: 40 to 59 years
- **> 60**: 60 years and above

Report is printed to console in formatted table.

## 🛠️ Development

### Dependencies

- **express**: Web framework for API
- **pg**: PostgreSQL client
- **dotenv**: Environment variable management

### Code Style

- ES6+ JavaScript
- Consistent naming conventions
- Comprehensive error handling
- Detailed comments

## 📝 Assumptions

1. First line in CSV is always headers
2. Mandatory fields (`name.firstName`, `name.lastName`, `age`) are always present
3. All `address.*` properties are grouped into `address` JSONB field
4. All other properties go into `additional_info` JSONB field
5. Age ranges are: <20, [20-40), [40-60), ≥60
6. CSV uses comma as delimiter
7. Files are UTF-8 encoded

## 🐛 Error Handling

- Missing mandatory fields: Throws error with row number
- Invalid CSV format: Skips row with warning
- Database connection failure: Returns 500 status
- File not found: Returns 404 status
- Malformed data: Logs warning and continues

## 📊 Performance Metrics

Tested with 50,000 records:
- **Parsing**: ~1-2 seconds
- **Database Insert**: ~12-15 seconds
- **Total Processing**: ~15-20 seconds
- **Memory Usage**: ~150-200 MB

## 🔒 Security

- Parameterized queries (prevents SQL injection)
- Environment variables for sensitive data
- Input validation for mandatory fields
- Error messages don't expose internal details

## 📄 License

MIT

## 👤 Author

Harsh Gadhavi

## 🙏 Acknowledgments

Built as with heart
