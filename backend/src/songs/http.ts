import { type Request, type Response, Router } from "express";
import type { AddSongRequestBody } from "../../../common/song";
import { ensureAuthMiddleware } from "../auth/http";
import { getBody, getParam, HttpError, HttpStatus, sendResult } from "../utils";
import { createSong, getSong, searchSong } from "./utils";

// GET ROUTES
async function get(req: Request, res: Response): Promise<void> {
    const id = parseInt(getParam(req, "id"));

    const song = (await getSong(id)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get song info from id: ${err}`),
    );
    sendResult(song, res);
}

// POST ROUTES
async function add(req: Request, res: Response): Promise<void> {
    const song = getBody<AddSongRequestBody>(req);

    const dbResult = (await createSong(song)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to create song in database: ${err}`),
    );
    sendResult(dbResult, res);
}

async function search(req: Request, res: Response): Promise<void> {
    const title = getParam(req, "title");
    const aid = parseInt(getParam(req, "aid"));

    const ids = (await searchSong(title, aid)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to search songs in database: ${err}`),
    );
    sendResult(ids, res);
}

const songApiRouter = Router();

songApiRouter.get("/get/:id", ensureAuthMiddleware, get);
songApiRouter.get("/search/:aid/:title", ensureAuthMiddleware, search);

songApiRouter.post("/add", ensureAuthMiddleware, add);

export { songApiRouter };
