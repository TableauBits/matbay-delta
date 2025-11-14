import { Router } from "express";
import { authApiRouter, authDevRouter } from "./auth/http";
import { constitutionApiRouter } from "./constitutions/http";
import { dbApiRouter, dbDevRouter } from "./db/http";
import { userApiRouter } from "./user/http";
import { artistApiRouter, songApiRouter } from "./songs/http";

const apiRouter = Router();
const devRouter = Router();

apiRouter.use("/auth", authApiRouter);
apiRouter.use("/artist", artistApiRouter);
apiRouter.use("/db", dbApiRouter);
apiRouter.use("/user", userApiRouter);
apiRouter.use("/constitution", constitutionApiRouter);
apiRouter.use("/song", songApiRouter);

devRouter.use("/auth", authDevRouter);
devRouter.use("/db", dbDevRouter);

export { apiRouter, devRouter };
