import { eq } from "drizzle-orm";
import { Option, Result } from "oxide.ts";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/http";
import { users } from "../db/schemas";
import type { DB } from "../db-namepsace";

async function createUser(userInfo: DB.Insert.User): Promise<void> {
    userInfo.id = uuidv4();

    await db.insert(users).values(userInfo);
}

// TODO : add a generic function to just search a row from an id ? Like :
// TODO : ...(table, column, value)
async function getUser(uid: string): Promise<Result<DB.Select.User, Error>> {
    const operation = async () => await db.select().from(users).where(eq(users.id, uid));

    const queryResult = await Result.safe(operation());
    if (queryResult.isErr()) return queryResult;

    return Option(queryResult.unwrap().at(0)).okOr(new Error(`No user with uid: ${uid}`));
}

async function getUserFromAuth(authID: string): Promise<Result<DB.Select.User, Error>> {
    const operation = async () => await db.select().from(users).where(eq(users.authID, authID));

    const queryResult = await Result.safe(operation());
    if (queryResult.isErr()) return queryResult;

    return Option(queryResult.unwrap().at(0)).okOr(new Error(`No user with authID: ${authID}`));
}

export { createUser, getUser, getUserFromAuth };
