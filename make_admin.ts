import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";

async function makeAdmin() {
    console.log("Updating users to admin role...");
    await db.update(users).set({ role: "admin" }).where(eq(users.email, "khaledahmedhaggagy@gmail.com"));
    // Also just update everyone to admin for easy local testing right now
    await db.update(users).set({ role: "admin" });
    console.log("Done.");
    process.exit(0);
}

makeAdmin().catch(console.error);
