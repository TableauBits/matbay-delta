import { type NextFunction, type Request, type Response, Router } from "express";
import { Err, Ok, Option, type Result } from "oxide.ts";

import { createUser, getUserFromAuth, type User } from "../user/mod";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { tokenDevRouter, validateToken } from "./token";

async function getAuthID(req: Request): Promise<Result<string, HttpError>> {
    // Try to get the delta-auth token from the header
    const headerFetch = Option(req.header("delta-auth")).okOr(
        new HttpError(HttpStatus.Unauthorized, "no token found in headers"),
    );
    if (headerFetch.isErr()) return headerFetch;

    // Validate the token
    const validation = await validateToken(headerFetch.unwrap());
    if (validation.isErr()) {
        return validation.mapErr(
            (err) => new HttpError(HttpStatus.Unauthorized, `failed to authenticate: ${err.message}`),
        );
    }

    // Extract and decode the authID from the token
    const maybeAuthID = Option(validation.unwrap().sub).okOr(
        new HttpError(
            HttpStatus.UnprocessableContent,
            "failed to authenticate: the decoded jwt does not provided the necessary 'aud' claim",
        ),
    );

    return maybeAuthID;
}

async function ensureAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    // Extract the authID from the request
    const maybeAuthID = await getAuthID(req);
    if (maybeAuthID.isErr()) {
        sendResult(maybeAuthID, res);
        return;
    }
    const authID = maybeAuthID.unwrap();

    // Check if the authID exists in our database
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

    next();
}

async function checkAuth(_req: Request, res: Response) {
    sendResult(Ok("successfully logged in"), res);
}

async function login(req: Request, res: Response) {
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
    if (maybeUser.isSome()) {
        sendResult(Ok(maybeUser.unwrap().id), res);
        return;
    }

    const newUser: User = {
        id: "",
        authID,
        displayName: validation.unwrap()["nickname"] ?? "New User",
        username: validation.unwrap()["name"] ?? authID,
        description: "",
        imageURL: validation.unwrap()["picture"] ?? "",
        joinDate: new Date().toISOString(),
    };

    await createUser(newUser);
    sendResult(Ok(newUser.id), res);
}

const authApiRouter = Router();
const authDevRouter = Router();

authDevRouter.use("/token", tokenDevRouter);
authDevRouter.use("/check", ensureAuthMiddleware, checkAuth);

authApiRouter.use("/login", login);

export { authApiRouter, authDevRouter, ensureAuthMiddleware, getAuthID };
