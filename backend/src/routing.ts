import { Router } from "express";
import { authApiRouter, authDevRouter } from "./auth/mod";
import { dbApiRouter, dbDevRouter } from "./db/mod";
import { userApiRouter } from "./user/mod";
import { constitutionApiRouter } from "./constitutions/mod";

const apiRouter = Router();
const devRouter = Router();

apiRouter.use("/auth", authApiRouter);
apiRouter.use("/db", dbApiRouter);
apiRouter.use("/user", userApiRouter);
apiRouter.use("/constitution", constitutionApiRouter);

devRouter.use("/auth", authDevRouter);
devRouter.use("/db", dbDevRouter);

export { apiRouter, devRouter };
