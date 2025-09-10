import { eq } from "drizzle-orm";
import { type Request, type Response, Router } from "express";
import { Err, None, Option, Some } from "oxide.ts";
import { v4 as uuidv4 } from "uuid";
import { ensureAuthMiddleware, getAuthID } from "../auth/mod";
import { db } from "../db/mod";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { usersTable } from "./schema";
import type { UserUpdateRequestBody } from "../../../common/user";

export type User = typeof usersTable.$inferInsert;

export async function createUser(userInfo: User): Promise<void> {
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

async function get(req: Request, res: Response): Promise<void> {
    const uid = Option(req.params["uid"]).okOr(new HttpError(HttpStatus.BadRequest, "missing user id from request"));
    if (uid.isErr()) {
        sendResult(uid, res);
        return;
    }

    const user = (await getUser(uid.unwrap())).okOr(
        new HttpError(HttpStatus.NotFound, "no user found with the specified uid"),
    );
    sendResult(user, res);
}

async function update(req: Request, res: Response): Promise<void> {
    // Extract the uid from the request
    const uid = Option(req.params["uid"]).okOr(new HttpError(HttpStatus.BadRequest, "missing user id from request"));
    if (uid.isErr()) {
        sendResult(uid, res);
        return;
    }

    // Extract the uid from the AuthId in the token
    const maybeAuthID = await getAuthID(req);
    if (maybeAuthID.isErr()) {
        sendResult(maybeAuthID, res);
        return;
    }
    const authID = maybeAuthID.unwrap();
    const maybeUser = await getUserFromAuth(authID);

    if (maybeUser.isNone()) {
        sendResult(
            Err(
                new HttpError(
                    HttpStatus.Unauthorized,
                    "account is valid but not registered, call the login endpoint first",
                ),
            ),
            res,
        );
        return;
    }
    const user = maybeUser.unwrap();

    if (user.id !== uid.unwrap()) {
        sendResult(
            Err(new HttpError(HttpStatus.Unauthorized, "cannot update another user's info")),
            res,
        );
        return;
    }

    // Extract the user info from the request body and update the database
    const userInfo = req.body as UserUpdateRequestBody;
    const queryResult = await db.update(usersTable).set(userInfo).where(eq(usersTable.id, uid.unwrap())).returning()
    
    const result = Some(queryResult[0] as User).okOr(
        new HttpError(HttpStatus.InternalError, "failed to update user info")
    );

    sendResult(result, res);
}

const userApiRouter = Router();

userApiRouter.use("/get/:uid", ensureAuthMiddleware, get);
userApiRouter.use("/update/:uid", ensureAuthMiddleware, update);

export { userApiRouter };
