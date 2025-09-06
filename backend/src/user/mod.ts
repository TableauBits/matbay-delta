import { eq } from "drizzle-orm";
import { None, Option, Some } from "oxide.ts";
import { v4 as uuidv4 } from "uuid";

import { db } from "../db/mod";
import { usersTable } from "./schema";
import { Router, type Request, type Response } from "express";
import { ensureAuthMiddleware } from "../auth/mod";
import { HttpError, HttpStatus, sendResult } from "../utils";

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

async function get(req: Request, res: Response) {
    const uid = Option(req.params["uid"]).okOr(new HttpError(HttpStatus.BadRequest, "missing user id from request"));
    if (uid.isErr()) {
        sendResult(uid, res);
        return;
    }

    const user = (await getUser(uid.unwrap())).okOr(new HttpError(HttpStatus.NotFound, "no user found with the specified uid"))
    sendResult(user, res);
}

const userApiRouter = Router();

userApiRouter.use("/get/:uid", ensureAuthMiddleware, get);

export { userApiRouter };