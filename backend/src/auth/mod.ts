import { type Request, type Response, Router } from "express";
import { checkNil } from "../utils";
import { tokenDevRouter, validateToken } from "./token";

async function checkAuth(req: Request, res: Response) {
    const idToken = checkNil(req.header("delta-auth"), "no token found in headers");
    if (idToken.isErr()) {
        res.sendStatus(400);
        return;
    }

    const validation = await validateToken(idToken.unwrap());
    if (validation.isErr()) {
        res.sendStatus(401);
        return;
    }

    res.sendStatus(200);
}

const authApiRouter = Router();
const authDevRouter = Router();

authDevRouter.use("/token", tokenDevRouter);
authDevRouter.use("/check", checkAuth);

export { authApiRouter, authDevRouter };
