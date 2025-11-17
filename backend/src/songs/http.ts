import { type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/http";
import type { AddSongRequestBody } from "../../../common/song";
import { getBody, getParam, HttpError, HttpStatus, sendResult } from "../utils";
import { createSong, getSong, searchSong } from "./utils";


// GET ROUTES
async function get(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id").map(val => parseInt(val));
    if (id.isErr()) {
        sendResult(id, res);
        return;
    }

    const song = (await getSong(id.unwrap())).mapErr(err =>
        new HttpError(HttpStatus.NotFound, `failed to get song info from id: ${err}`)
    );
    sendResult(song, res);
}


// POST ROUTES
async function add(req: Request, res: Response): Promise<void> {
    const song = getBody<AddSongRequestBody>(req);
    if (song.isErr()) {
        sendResult(song, res);
        return;
    }

    const dbResult = (await createSong(song.unwrap()))
        .mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to create song in database: ${err}`));

    sendResult(dbResult, res);
}

async function searchIDFromTitle(req: Request, res: Response): Promise<void> {
    const title = getParam(req, "title");
    if (title.isErr()) {
        sendResult(title, res);
        return;
    }
    const aid = getParam(req, "aid").map(val => parseInt(val));
    if (aid.isErr()) {
        sendResult(aid, res);
        return;
    }

    const ids = (await searchSong(title.unwrap(), aid.unwrap()))
        .mapErr(err => new HttpError(HttpStatus.InternalError, `failed to search songs in database: ${err}`));

    sendResult(ids, res);
}

const songApiRouter = Router();

songApiRouter.get("/get/:id", ensureAuthMiddleware, get);
songApiRouter.get("/search/:aid/:title", ensureAuthMiddleware, searchIDFromTitle);

songApiRouter.post("/add", ensureAuthMiddleware, add);

export { songApiRouter };