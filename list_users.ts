import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";
import fs from "fs";

async function listUsers() {
    const allUsers = await db.select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
    }).from(users);

    const output = JSON.stringify(allUsers, null, 2);
    fs.writeFileSync("users_list.json", output);
    console.log(output);
    process.exit(0);
}

listUsers().catch(console.error);
