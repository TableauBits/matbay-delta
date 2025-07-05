import { type NextFunction, type Request, type Response, Router } from "express";
import { Ok } from "../result";
import { checkNil } from "../utils";
import { tokenDevRouter, validateToken } from "./token";

async function ensureAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const result = checkNil(req.header("delta-auth"), "no token found in headers");
    if (result.isErr()) {
        res.statusCode = 401;
        res.send(result);
        return;
    }

    const validation = await validateToken(result.unwrap());
    if (validation.isErr()) {
        res.statusCode = 401;
        res.send(validation);
        return;
    }

    next();
}

async function checkAuth(_req: Request, res: Response) {
    res.statusCode = 200;
    res.send(Ok("Authentication valid"));
}

const authApiRouter = Router();
const authDevRouter = Router();

authDevRouter.use("/token", tokenDevRouter);
authDevRouter.use("/check", ensureAuthMiddleware, checkAuth);

export { authApiRouter, authDevRouter };
