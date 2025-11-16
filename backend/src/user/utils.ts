import { v4 as uuidv4 } from "uuid";
import { users } from "./schema";
import type { DB } from "../db-namepsace";
import { db } from "../db/http";
import { None, Some, type Option } from "oxide.ts";
import { eq } from "drizzle-orm";


async function createUser(userInfo: DB.Insert.User): Promise<void> {
    userInfo.id = uuidv4();

    await db.insert(users).values(userInfo);
}

async function getUser(uid: string): Promise<Option<DB.Select.User>> {
    const queryResult = await db.select().from(users).where(eq(users.id, uid));
    if (queryResult.length === 0) {
        return None;
    }

    return Some(queryResult[0] as DB.Select.User);
}

async function getUserFromAuth(authID: string): Promise<Option<DB.Select.User>> {
    const queryResult = await db.select().from(users).where(eq(users.authID, authID));
    if (queryResult.length === 0) {
        return None;
    }

    return Some(queryResult[0] as DB.Select.User);
}


export { createUser, getUser, getUserFromAuth }