import { eq } from "drizzle-orm";
import { type Request, type Response, Router } from "express";
import { Option, Some } from "oxide.ts";
import type { UserUpdateRequestBody } from "../../../common/user";
import { ensureAuthMiddleware } from "../auth/http";
import { db } from "../db/http";
import type { DB } from "../db-namepsace";
import { getBody, getReqUID, HttpError, HttpStatus, sendResult } from "../utils";
import { users } from "./schema";
import { getUser } from "./utils";

 
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
    const userInfo = getBody<UserUpdateRequestBody>(req);
    if (userInfo.isErr()) {
        sendResult(userInfo, res);
        return;
    }

    const uid = getReqUID(req);
    if (uid.isErr()) {
        sendResult(uid, res);
        return;
    }

    // Extract the user info from the request body and update the database
    const queryResult = await db.update(users).set(userInfo.unwrap()).where(eq(users.id, uid.unwrap())).returning();

    const result = Some(queryResult[0] as DB.Select.User).okOr(
        new HttpError(HttpStatus.InternalError, "failed to update user info"),
    );

    sendResult(result, res);
}

const userApiRouter = Router();

userApiRouter.get("/get/:uid", ensureAuthMiddleware, get);
userApiRouter.post("/update", ensureAuthMiddleware, update);

export { userApiRouter };
