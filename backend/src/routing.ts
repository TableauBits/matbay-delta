import { Router } from "express";
import { authApiRouter, authDevRouter } from "./auth/mod";

const apiRouter = Router();
const devRouter = Router();

apiRouter.use("/auth", authApiRouter);
devRouter.use("/auth", authDevRouter);

export { apiRouter, devRouter };
