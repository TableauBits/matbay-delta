import { type Request, type Response, Router } from "express";
import type { AddArtistRequestBody } from "../../../common/artist";
import { ensureAuthMiddleware } from "../auth/http";
import { getBody, getParam, HttpError, HttpStatus, sendResult } from "../utils";
import { createArtist, getArtist, getArtistsIDFromName } from "./utils";

// GET ROUTES
async function get(req: Request, res: Response): Promise<void> {
    const id = parseInt(getParam(req, "id"));

    const artist = (await getArtist(id)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get artist info from id: ${err}`),
    );
    sendResult(artist, res);
}

async function search(req: Request, res: Response): Promise<void> {
    const name = getParam(req, "name");

    const ids = (await getArtistsIDFromName(name)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to search artist in database: ${err}`),
    );

    sendResult(ids, res);
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
artistApiRouter.get("/search/:name", ensureAuthMiddleware, search);

artistApiRouter.post("/add", ensureAuthMiddleware, add);

export { artistApiRouter };
