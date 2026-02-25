import { db } from "./server/db";
import { users, salons, bookings, coupons, services, messages } from "./shared/schema";
import { sql } from "drizzle-orm";

async function checkCounts() {
    try {
        const u = await db.select({ count: sql`count(*)` }).from(users);
        const s = await db.select({ count: sql`count(*)` }).from(salons);
        const b = await db.select({ count: sql`count(*)` }).from(bookings);
        const c = await db.select({ count: sql`count(*)` }).from(coupons);
        const sv = await db.select({ count: sql`count(*)` }).from(services);
        const m = await db.select({ count: sql`count(*)` }).from(messages);

        console.log("Stats Check:");
        console.log("- Users:", u[0].count);
        console.log("- Salons:", s[0].count);
        console.log("- Bookings:", b[0].count);
        console.log("- Coupons:", c[0].count);
        console.log("- Services:", sv[0].count);
        console.log("- Messages:", m[0].count);

        process.exit(0);
    } catch (err) {
        console.error("Error checking counts:", err);
        process.exit(1);
    }
}

checkCounts();
