import { type Request, type Response, Router } from "express";
import { check_nil } from "../utils";
import { token_dev_router, validate_token } from "./token";

async function check_auth(req: Request, res: Response) {
    const id_token = check_nil(req.header("delta-auth"), "no token found in headers");
    if (id_token.is_err()) {
        res.sendStatus(400);
        return;
    }

    const validation = await validate_token(id_token.unwrap());
    if (validation.is_err()) {
        res.sendStatus(401);
        return;
    }

    res.sendStatus(200);
}

const auth_api_router = Router();
const auth_dev_router = Router();

auth_dev_router.use("/token", token_dev_router);
auth_dev_router.use("/check", check_auth);

export { auth_api_router, auth_dev_router };
