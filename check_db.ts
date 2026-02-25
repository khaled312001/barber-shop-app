import { db } from "./server/db";
import { users } from "./shared/schema";
import { sql } from "drizzle-orm";

async function checkSchema() {
    try {
        console.log("Checking columns for 'users' table...");
        const result = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'loyalty_points';
        `);
        console.log("Result:", result.rows);
        if (result.rows.length > 0) {
            console.log("SUCCESS: loyalty_points column exists.");
        } else {
            console.log("FAILURE: loyalty_points column MISSING.");
        }
        process.exit(0);
    } catch (err) {
        console.error("Error checking schema:", err);
        process.exit(1);
    }
}

checkSchema();
