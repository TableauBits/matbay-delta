import Elysia, { type Context } from "elysia";
import { checkNil } from "../utils";
import { tokenDevRouter, validateToken } from "./token";

async function ensureAuth(ctx: Context) {
    const { status, headers } = ctx;
    const result = checkNil(headers["delta-auth"], "no token found in headers");
    if (result.isErr()) {
        return status(401, result.getErr());
    }

    const validation = await validateToken(result.unwrap());
    if (validation.isErr()) {
        return status(401, validation.getErr());
    }

    return;
}

async function checkAuth() {
    return {};
}

const authApiRouter = new Elysia({ prefix: "/auth" });
const authDevRouter = new Elysia({ prefix: "/auth" });

authDevRouter.use(tokenDevRouter);
authDevRouter.get("/check", checkAuth, {
    beforeHandle: ensureAuth,
});

export { authApiRouter, authDevRouter };
