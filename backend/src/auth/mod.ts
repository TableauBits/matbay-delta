import { type NextFunction, type Request, type Response, Router } from "express";
import { Ok, Option } from "oxide.ts";

import { HttpError, HttpStatus, sendResult } from "../utils";
import { tokenDevRouter, validateToken } from "./token";

async function ensureAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const result = Option(req.header("delta-auth")).okOr(
        new HttpError(HttpStatus.Unauthorized, "no token found in headers"),
    );
    if (result.isErr()) {
        sendResult(result, res);
        return;
    }

    const validation = await validateToken(result.unwrap());
    if (validation.isErr()) {
        const error = validation.mapErr(
            (err) => new HttpError(HttpStatus.Unauthorized, `failed to authenticate: ${err.message}`),
        );
        sendResult(error, res);
        return;
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
