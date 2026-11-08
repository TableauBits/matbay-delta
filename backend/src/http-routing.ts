import { Router } from "express";
import { artistApiRouter } from "./artist/http";
import { authApiRouter, authDevRouter } from "./auth/http";
import { constitutionApiRouter } from "./constitution/http";
import { dbApiRouter, dbDevRouter } from "./db/http";
import { songApiRouter } from "./song/http";
import { userApiRouter } from "./user/http";
import { errorHandler } from "./utils";
import { statApiRouter } from "./stat/http";

const apiRouter = Router();
const devRouter = Router();

apiRouter.use("/auth", authApiRouter);
apiRouter.use("/artist", artistApiRouter);
apiRouter.use("/constitution", constitutionApiRouter);
apiRouter.use("/db", dbApiRouter);
apiRouter.use("/song", songApiRouter);
apiRouter.use("/stat", statApiRouter);
apiRouter.use("/user", userApiRouter);

devRouter.use("/auth", authDevRouter);
devRouter.use("/db", dbDevRouter);

// These NEED TO BE LAST. Add other routes ABOVE.
apiRouter.use(errorHandler);
devRouter.use(errorHandler);

export { apiRouter, devRouter };
