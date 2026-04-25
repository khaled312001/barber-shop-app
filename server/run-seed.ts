import { seedDatabase } from "./seed";
import { pool } from "./db";

async function main() {
  try {
    process.env.FORCE_SEED = "true";
    await seedDatabase();
    console.log("Seed complete.");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await (pool as any).end();
    process.exit(0);
  }
}

main();
