import { db } from "./server/db";
import { salons } from "./shared/schema";

async function checkSalons() {
    try {
        const allSalons = await db.select().from(salons);
        console.log(JSON.stringify(allSalons, null, 2));
    } catch (err) {
        console.error(err);
    }
}

checkSalons();
