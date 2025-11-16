import { type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/http";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { type AddArtistRequestBody, type GetArtistIDByNameBody } from "../../../common/song";
import { createArtist, getArtistsIDFromName } from "./utils";


async function add(req: Request, res: Response): Promise<void> {
    const artist = req.body as AddArtistRequestBody;

    // TODO : check if artist already exists and return it instead of creating a new one

    const dbResult = (await createArtist(artist))
        .mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to create artist in database: ${err}`));

    sendResult(dbResult, res);
}


async function searchIDFromName(req: Request, res: Response): Promise<void> {
    const body = req.body as GetArtistIDByNameBody;

    const ids = (await getArtistsIDFromName(body.name))
        .mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to search artist in database: ${err}`));

    sendResult(ids, res);
}


const artistApiRouter = Router();

artistApiRouter.post("/add", ensureAuthMiddleware, add);
artistApiRouter.post("/searchIDFromName", ensureAuthMiddleware, searchIDFromName);

export { artistApiRouter };