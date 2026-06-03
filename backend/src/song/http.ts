import { type Request, type Response, Router } from "express";
import type { AddSongRequestBody } from "../../../common/song";
import { ensureAuthMiddleware } from "../auth/http";
import { getBody, getParam, HttpError, HttpStatus, sendResult } from "../utils";
import { addSong, getSong, searchSong, searchSongsByTitle } from "./utils";

// GET ROUTES
async function get(req: Request, res: Response): Promise<void> {
    const id = parseInt(getParam(req, "id"), 10);

    const song = (await getSong(id)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get song info from id: ${err}`),
    );
    sendResult(song, res);
}

// POST ROUTES
async function add(req: Request, res: Response): Promise<void> {
    const body = getBody<AddSongRequestBody>(req);

    const dbResult = (await addSong(body.song, body.otherContributions, body.sources)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to create song in database: ${err}`),
    );
    sendResult(dbResult, res);
}

async function search(req: Request, res: Response): Promise<void> {
    const title = getParam(req, "title");
    const aid = parseInt(getParam(req, "aid"), 10);

    const ids = (await searchSong(title, aid)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to search songs in database: ${err}`),
    );
    sendResult(ids, res);
}

async function autocomplete(req: Request, res: Response): Promise<void> {
    const query = getParam(req, "query");
    const artistId = req.query["artistId"] ? parseInt(req.query["artistId"] as string, 10) : undefined;

    const results = (await searchSongsByTitle(query, artistId)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to autocomplete songs in database: ${err}`),
    );

    sendResult(results, res);
}

const songApiRouter = Router();

songApiRouter.get("/get/:id", ensureAuthMiddleware, get);
songApiRouter.get("/search/:aid/:title", ensureAuthMiddleware, search);
songApiRouter.get("/autocomplete/:query", ensureAuthMiddleware, autocomplete);

songApiRouter.post("/add", ensureAuthMiddleware, add);

export { songApiRouter };
