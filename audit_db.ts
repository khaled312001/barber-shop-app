import { db } from "./server/db";
import { users, salons, bookings, coupons, services, messages } from "./shared/schema";
import { sql } from "drizzle-orm";

async function auditDb() {
    try {
        const c = await db.select().from(coupons);
        const s = await db.select().from(services);
        const m = await db.select().from(messages);

        console.log("Database Audit:");
        console.log("- Coupons Count:", c.length);
        console.log("- Services Count:", s.length);
        console.log("- Messages Count:", m.length);

        if (c.length === 0) console.log("WARNING: Coupons table is empty.");
        if (s.length === 0) console.log("WARNING: Services table is empty.");
        if (m.length === 0) console.log("WARNING: Messages table is empty.");

        process.exit(0);
    } catch (err) {
        console.error("Audit failed:", err);
        process.exit(1);
    }
}

auditDb();
