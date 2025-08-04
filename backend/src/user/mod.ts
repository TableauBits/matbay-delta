import { eq } from "drizzle-orm";
import { None, type Option, Some } from "oxide.ts";
import { v4 as uuidv4 } from "uuid";

import { db } from "../db/mod";
import { usersTable } from "./schema";

export type User = typeof usersTable.$inferInsert;

export async function createUser(userInfo: User) {
    userInfo.id = uuidv4();

    await db.insert(usersTable).values(userInfo);
}

export async function getUserFromAuth(authID: string): Promise<Option<User>> {
    const queryResult = await db.select().from(usersTable).where(eq(usersTable.authID, authID));
    if (queryResult.length === 0) {
        return None;
    }

    return Some(queryResult[0] as User);
}

export async function getUser(uid: string): Promise<Option<User>> {
    const queryResult = await db.select().from(usersTable).where(eq(usersTable.id, uid));
    if (queryResult.length === 0) {
        return None;
    }

    return Some(queryResult[0] as User);
}
