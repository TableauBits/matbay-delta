import { Router } from "express";
import { artistApiRouter } from "./artists/http";
import { authApiRouter, authDevRouter } from "./auth/http";
import { constitutionApiRouter } from "./constitutions/http";
import { dbApiRouter, dbDevRouter } from "./db/http";
import { songApiRouter } from "./songs/http";
import { userApiRouter } from "./user/http";
import { errorHandler } from "./utils";

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

// These NEED TO BE LAST. Add other routes ABOVE.
apiRouter.use(errorHandler);
devRouter.use(errorHandler);

export { apiRouter, devRouter };
