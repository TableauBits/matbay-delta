import { eq } from "drizzle-orm";
import { type Request, type Response, Router } from "express";
import { Some } from "oxide.ts";
import type { UserUpdateRequestBody } from "../../../common/user";
import { ensureAuthMiddleware } from "../auth/http";
import { db } from "../db/http";
import type { DB } from "../db-namepsace";
import { getBody, getParam, getReqUID, HttpError, HttpStatus, sendResult } from "../utils";
import { users } from "./schema";
import { getUser } from "./utils";

async function get(req: Request, res: Response): Promise<void> {
    const uid = getParam(req, "uid");

    const user = (await getUser(uid)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get user info from uid ${err}`),
    );
    sendResult(user, res);
}

async function update(req: Request, res: Response): Promise<void> {
    const userInfo = getBody<UserUpdateRequestBody>(req);
    const uid = getReqUID(req);

    // Extract the user info from the request body and update the database
    const queryResult = await db.update(users).set(userInfo).where(eq(users.id, uid)).returning();
    const result = Some(queryResult[0] as DB.Select.User).okOr(
        new HttpError(HttpStatus.InternalError, "failed to update user info"),
    );

    sendResult(result, res);
}

const userApiRouter = Router();

userApiRouter.get("/get/:uid", ensureAuthMiddleware, get);
userApiRouter.post("/update", ensureAuthMiddleware, update);

export { userApiRouter };
