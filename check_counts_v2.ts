import { db } from "./server/db";
import { users, salons, bookings, coupons, services, messages } from "./shared/schema";
import { sql, eq } from "drizzle-orm";

async function checkCounts() {
    console.log("Starting DB check...");
    try {
        await db.execute(sql`SELECT 1`);
        console.log("Database connection successful.");

        const u = await db.select({ count: sql<number>`count(*)` }).from(users);
        const s = await db.select({ count: sql<number>`count(*)` }).from(salons);
        const b = await db.select({ count: sql<number>`count(*)` }).from(bookings);
        const c = await db.select({ count: sql<number>`count(*)` }).from(coupons);
        const sv = await db.select({ count: sql<number>`count(*)` }).from(services);
        const m = await db.select({ count: sql<number>`count(*)` }).from(messages);

        const pending = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(eq(bookings.status, 'pending'));
        const completed = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(eq(bookings.status, 'completed'));

        const output = `
Stats Check:
- Users: ${JSON.stringify(u[0])}
- Salons: ${JSON.stringify(s[0])}
- Bookings: ${JSON.stringify(b[0])}
- Coupons: ${JSON.stringify(c[0])}
- Services: ${JSON.stringify(sv[0])}
- Messages: ${JSON.stringify(m[0])}
- Pending: ${JSON.stringify(pending[0])}
- Completed: ${JSON.stringify(completed[0])}
`;
        process.stdout.write(output);
        process.exit(0);
    } catch (err) {
        console.error("Error checking counts:", err);
        process.exit(1);
    }
}

checkCounts();
