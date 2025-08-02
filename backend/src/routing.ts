import { Router } from "express";
import { authApiRouter, authDevRouter } from "./auth/mod";
import { dbApiRouter, dbDevRouter } from "./db/mod";

const apiRouter = Router();
const devRouter = Router();

apiRouter.use("/auth", authApiRouter);
apiRouter.use("/db", dbApiRouter);

devRouter.use("/auth", authDevRouter);
devRouter.use("/db", dbDevRouter);

export { apiRouter, devRouter };
