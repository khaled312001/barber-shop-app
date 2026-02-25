const fs = require('fs');
const path = require('path');
try {
    const dotenv = require('dotenv');
    console.log("Loading .env from:", path.resolve(process.cwd(), '.env'));
    const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    if (result.error) {
        fs.writeFileSync('db_check_result.txt', "Dotenv Error: " + result.error.message);
    } else {
        fs.writeFileSync('db_check_result.txt', "DATABASE_URL: " + (process.env.DATABASE_URL ? "FOUND (starts with " + process.env.DATABASE_URL.substring(0, 10) + "...)" : "NOT FOUND"));
    }
} catch (e) {
    fs.writeFileSync('db_check_result.txt', "Catch Error: " + e.message);
}
