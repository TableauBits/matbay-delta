import { type Request, type Response, Router } from "express";
import type { AddArtistRequestBody } from "../../../common/artist";
import { ensureAuthMiddleware } from "../auth/http";
import { getBody, getParam, getQuery, HttpError, HttpStatus, sanitizeLikeQuery, sendResult } from "../utils";
import { createArtist, getArtist, getSongsByArtist, searchArtistsByName } from "./utils";

// GET ROUTES
async function get(req: Request, res: Response): Promise<void> {
    const id = parseInt(getParam(req, "id"), 10);

    const artist = (await getArtist(id)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get artist info from id: ${err}`),
    );
    sendResult(artist, res);
}

async function autocomplete(req: Request, res: Response): Promise<void> {
    const query = sanitizeLikeQuery(getQuery(req, "name"));

    const results = (await searchArtistsByName(query)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to autocomplete artist in database: ${err}`),
    );

    sendResult(results, res);
}

async function songs(req: Request, res: Response): Promise<void> {
    const id = parseInt(getParam(req, "id"), 10);

    const songs = (await getSongsByArtist(id)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get songs for artist with id: ${id}: ${err}`),
    );

    sendResult(songs, res);
}

// POST ROUTES
async function add(req: Request, res: Response): Promise<void> {
    const artist = getBody<AddArtistRequestBody>(req);

    // TODO : check if artist already exists and return it instead of creating a new one

    const dbResult = (await createArtist(artist)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to create artist in database: ${err}`),
    );

    sendResult(dbResult, res);
}

const artistApiRouter = Router();

artistApiRouter.get("/get/:id", ensureAuthMiddleware, get);
artistApiRouter.get("/autocomplete", ensureAuthMiddleware, autocomplete);
artistApiRouter.get("/songs/:id", ensureAuthMiddleware, songs);

artistApiRouter.post("/add", ensureAuthMiddleware, add);

export { artistApiRouter };
