import { type NextFunction, type Request, type Response, Router } from "express";
import { Ok, Option } from "oxide.ts";

import { createUser, getUserFromAuth, type User } from "../user/mod";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { tokenDevRouter, validateToken } from "./token";

async function ensureAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const headerFetch = Option(req.header("delta-auth")).okOr(
        new HttpError(HttpStatus.Unauthorized, "no token found in headers"),
    );
    if (headerFetch.isErr()) {
        sendResult(headerFetch, res);
        return;
    }

    const validation = await validateToken(headerFetch.unwrap());
    if (validation.isErr()) {
        const error = validation.mapErr(
            (err) => new HttpError(HttpStatus.Unauthorized, `failed to authenticate: ${err.message}`),
        );
        sendResult(error, res);
        return;
    }

    const maybeAuthID = Option(validation.unwrap().sub).okOr(
        new HttpError(
            HttpStatus.UnprocessableContent,
            "failed to authenticate: the decoded jwt does not provided the necessary 'aud' claim",
        ),
    );
    if (maybeAuthID.isErr()) {
        sendResult(maybeAuthID, res);
        return;
    }

    const authID = maybeAuthID.unwrap();
    const maybeUser = await getUserFromAuth(authID);
    if (maybeUser.isNone()) {
        const newUser: User = {
            id: "",
            authID,
            username: authID,
            description: "",
            imageURL: "",
            joinDate: new Date().toISOString(),
        };
        await createUser(newUser);
    }

    next();
}

async function checkAuth(_req: Request, res: Response) {
    sendResult(Ok("Authentication valid"), res);
}

const authApiRouter = Router();
const authDevRouter = Router();

authDevRouter.use("/token", tokenDevRouter);
authDevRouter.use("/check", ensureAuthMiddleware, checkAuth);

export { authApiRouter, authDevRouter };
