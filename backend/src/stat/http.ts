import { type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/http";
import { getGlobalStats, getUserStats } from "./utils";
import { getParam, HttpError, HttpStatus, sendResult } from "../utils";

// GET ROUTES
async function get(req: Request, res: Response): Promise<void> {
  const uid = getParam(req, "uid");
  const stats = (await getUserStats(uid)).mapErr(
    (err) => new HttpError(HttpStatus.InternalError, `failed to get user stats for user ${uid} from database: ${err}`),
  );

  sendResult(stats, res);
}

async function global(_: Request, res: Response): Promise<void> {
  const stats = (await getGlobalStats()).mapErr(
    (err) => new HttpError(HttpStatus.InternalError, `failed to get global stats from database: ${err}`),
  )

  sendResult(stats, res);
}

const statApiRouter = Router();

statApiRouter.get("/get/:uid", ensureAuthMiddleware, get);
statApiRouter.get("/global", ensureAuthMiddleware, global);

export { statApiRouter };