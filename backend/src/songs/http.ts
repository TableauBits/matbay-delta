import { type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/http";
import type { AddSongRequestBody } from "../../../common/song";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { createSong } from "./utils";


async function add(req: Request, res: Response): Promise<void> {
    const song = req.body as AddSongRequestBody;
    const dbResult = (await createSong(song))
        .mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to create song in database: ${err}`));

    sendResult(dbResult, res);
}


const songApiRouter = Router();

songApiRouter.post("/add", ensureAuthMiddleware, add);

export { songApiRouter };