import { type NextFunction, type Request, type Response, Router } from "express";
import { Err, Ok, Option } from "oxide.ts";
import { createUser, getUserFromAuth } from "../user/utils";
import { HttpError, HttpStatus, sendResult, unwrapHTTP } from "../utils";
import { tokenDevRouter, validateToken } from "./token";

async function ensureAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
    const headerFetch = unwrapHTTP(
        Option(req.header("delta-auth")).okOr(new HttpError(HttpStatus.Unauthorized, "no token found in headers")),
    );

    const validation = unwrapHTTP(
        (await validateToken(headerFetch)).mapErr(
            (err) => new HttpError(HttpStatus.Unauthorized, `failed to authenticate: ${err.message}`),
        ),
    );

    const authID = unwrapHTTP(
        Option(validation.sub).okOr(
            new HttpError(
                HttpStatus.UnprocessableContent,
                "failed to authenticate: the decoded jwt does not provided the necessary 'aud' claim",
            ),
        ),
    );

    const user = unwrapHTTP(
        (await getUserFromAuth(authID)).mapErr(
            (err) =>
                new HttpError(
                    HttpStatus.Unauthorized,
                    `account is valid but not registered, call the login endpoint first : ${err}`,
                ),
        ),
    );

    // Save uid in the request for later use
    req.uid = user.id;

    next();
}

async function check(_req: Request, res: Response) {
    sendResult(Ok("successfully logged in"), res);
}

async function login(req: Request, res: Response) {
    const headerFetch = unwrapHTTP(
        Option(req.header("delta-auth")).okOr(new HttpError(HttpStatus.Unauthorized, "no token found in headers")),
    );

    const tokenPayload = unwrapHTTP(
        (await validateToken(headerFetch)).mapErr(
            (err) => new HttpError(HttpStatus.Unauthorized, `failed to authenticate: ${err.message}`),
        ),
    );

    const authID = unwrapHTTP(
        Option(tokenPayload.sub).okOr(
            new HttpError(
                HttpStatus.UnprocessableContent,
                "failed to authenticate: the decoded jwt does not provided the necessary 'aud' claim",
            ),
        ),
    );

    const user = await getUserFromAuth(authID);
    if (user.isOk()) {
        sendResult(Ok(user.unwrap().id), res);
        return;
    }

    const newUser = {
        id: "",
        authID,
        displayName: tokenPayload["nickname"] ?? "New User",
        username: tokenPayload["name"] ?? authID,
        description: "",
        imageURL: tokenPayload["picture"] ?? "",
        joinDate: new Date().toISOString(),
    };
    await createUser(newUser);
    sendResult(Ok(newUser.id), res);
}

function crash(_req: Request, _res: Response) {
    throw "test";
}

function crashHTTP(_req: Request, _res: Response) {
    unwrapHTTP(Err(new HttpError(HttpStatus.BadRequest, "wesh")));
}

const authApiRouter = Router();
const authDevRouter = Router();

authDevRouter.use("/token", tokenDevRouter);

authDevRouter.get("/check", ensureAuthMiddleware, check);
authDevRouter.get("/crash", crash);
authDevRouter.get("/crashHTTP", crashHTTP);
authApiRouter.get("/login", login);

export { authApiRouter, authDevRouter, ensureAuthMiddleware };
