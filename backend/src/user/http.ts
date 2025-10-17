import { eq } from "drizzle-orm";
import { type Request, type Response, Router } from "express";
import { Err, None, Option, Some } from "oxide.ts";
import { v4 as uuidv4 } from "uuid";
import type { UserUpdateRequestBody } from "../../../common/user";
import { ensureAuthMiddleware } from "../auth/http";
import { db } from "../db/http";
import type { DB } from "../db-namepsace";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { users } from "./schema";

export async function createUser(userInfo: DB.Insert.User): Promise<void> {
    userInfo.id = uuidv4();

    await db.insert(users).values(userInfo);
}

export async function getUserFromAuth(authID: string): Promise<Option<DB.Select.User>> {
    const queryResult = await db.select().from(users).where(eq(users.authID, authID));
    if (queryResult.length === 0) {
        return None;
    }

    return Some(queryResult[0] as DB.Select.User);
}

export async function getUser(uid: string): Promise<Option<DB.Select.User>> {
    const queryResult = await db.select().from(users).where(eq(users.id, uid));
    if (queryResult.length === 0) {
        return None;
    }

    return Some(queryResult[0] as DB.Select.User);
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

    // Ensure the user is updating their own info
    if (req.uid !== uid.unwrap()) {
        sendResult(Err(new HttpError(HttpStatus.Unauthorized, "cannot update another user's info")), res);
        return;
    }

    // Extract the user info from the request body and update the database
    const userInfo = req.body as UserUpdateRequestBody;
    const queryResult = await db.update(users).set(userInfo).where(eq(users.id, uid.unwrap())).returning();

    const result = Some(queryResult[0] as DB.Select.User).okOr(
        new HttpError(HttpStatus.InternalError, "failed to update user info"),
    );

    sendResult(result, res);
}

const userApiRouter = Router();

userApiRouter.use("/get/:uid", ensureAuthMiddleware, get);
userApiRouter.use("/update/:uid", ensureAuthMiddleware, update);

export { userApiRouter };
