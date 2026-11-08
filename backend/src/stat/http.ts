import { type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/http";
import { getGlobalStats } from "./utils";
import { HttpError, HttpStatus, sendResult } from "../utils";

// GET ROUTES
async function get(req: Request, res: Response): Promise<void> {}

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