import { type Request, type Response, Router } from "express";
import type { AddSongRequestBody } from "../../../common/song";
import { ensureAuthMiddleware } from "../auth/http";
import { getBody, getParam, HttpError, HttpStatus, sendResult } from "../utils";
import { addSong, getSong, getSongConstitution, searchSongsByTitle } from "./utils";

// GET ROUTES
async function autocomplete(req: Request, res: Response): Promise<void> {
    const query = getParam(req, "query");

    const results = (await searchSongsByTitle(query)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to autocomplete songs in database: ${err}`),
    );

    sendResult(results, res);
}

async function get(req: Request, res: Response): Promise<void> {
    const id = parseInt(getParam(req, "id"), 10);

    const song = (await getSong(id)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get song info from id: ${err}`),
    );
    sendResult(song, res);
}

async function participate(req: Request, res: Response): Promise<void> {
    const id = parseInt(getParam(req, "id"), 10);

    const participations = (await getSongConstitution(id)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to get song constitution info from id: ${err}`),
    );
    sendResult(participations, res);
}

// POST ROUTES
async function add(req: Request, res: Response): Promise<void> {
    const body = getBody<AddSongRequestBody>(req);

    const dbResult = (await addSong(body)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to create song in database: ${err}`),
    );
    sendResult(dbResult, res);
}

const songApiRouter = Router();

songApiRouter.get("/autocomplete/:query", ensureAuthMiddleware, autocomplete);
songApiRouter.get("/get/:id", ensureAuthMiddleware, get);
songApiRouter.get("/participate/:id", ensureAuthMiddleware, participate);

songApiRouter.post("/add", ensureAuthMiddleware, add);

export { songApiRouter };
