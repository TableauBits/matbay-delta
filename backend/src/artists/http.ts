import { type Request, type Response, Router } from "express";
import type { AddArtistRequestBody } from "../../../common/song";
import { ensureAuthMiddleware } from "../auth/http";
import { getBody, getParam, HttpError, HttpStatus, sendResult } from "../utils";
import { createArtist, getArtistsIDFromName } from "./utils";

// GET ROUTES
async function searchIDFromName(req: Request, res: Response): Promise<void> {
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

artistApiRouter.post("/add", ensureAuthMiddleware, add);
artistApiRouter.post("/search/:name", ensureAuthMiddleware, searchIDFromName);

export { artistApiRouter };
