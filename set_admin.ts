import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";
import fs from "fs";

async function makeAdminAndVerify() {
    // Update ALL users to admin role
    await db.update(users).set({ role: "admin" });

    // Verify the update
    const allUsers = await db.select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
    }).from(users);

    fs.writeFileSync("admin_result.json", JSON.stringify(allUsers, null, 2));
    process.exit(0);
}

makeAdminAndVerify().catch((err) => {
    fs.writeFileSync("admin_result.json", "ERROR: " + err.message);
    process.exit(1);
});
