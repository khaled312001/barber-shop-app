import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";
import * as storage from "./server/storage";

async function testLogin() {
    const email = "khaledahmedhaggagy@gmail.com";
    const pass = "Khaled312001*";

    const user = await storage.getUserByEmail(email);
    console.log("User:", user ? { ...user, password: "<hidden>" } : "Not found");

    if (user) {
        console.log("User password hash starts with:", user.password.substring(0, 7) + "...");
        const valid = await storage.verifyPassword(pass, user.password);
        console.log("Password valid:", valid);

        if (!valid) {
            console.log("Updating password to the correct one...");
            const bcrypt = require("bcryptjs");
            const newHash = await bcrypt.hash(pass, 10);
            await db.update(users).set({ password: newHash }).where(eq(users.id, user.id));
            console.log("Password updated.");
        }
    } else {
        console.log("Creating user...");
        await storage.createUser({
            fullName: "Khaled",
            email: email,
            password: pass
        });
        console.log("User created.");
    }
    process.exit(0);
}

testLogin().catch(console.error);
