import Elysia from "elysia";
import { authApiRouter, authDevRouter } from "./auth/mod";

const apiRouter = new Elysia({ prefix: "/api" });
const devRouter = new Elysia({ prefix: "/dev" });

apiRouter.use(authApiRouter);
devRouter.use(authDevRouter);

export { apiRouter, devRouter };
