import * as dotenv from "dotenv";
import path from "path";
console.log("--- DB.TS DEBUG START ---");
console.log("CWD:", process.cwd());
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
console.log("DB_TS_ENV_LOADED. DATABASE_URL present:", !!process.env.DATABASE_URL);
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
