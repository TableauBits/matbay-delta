import { type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/http";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { Result } from "oxide.ts";
import type { DB } from "../db-namepsace";
import { eq } from "drizzle-orm";
import { artists } from "../songs/schema";
import { db } from "../db/http";
import { type AddArtistRequestBody, type GetArtistIDByNameBody } from "../../../common/song";

async function createArtist(artist: DB.Insert.Artist): Promise<Result<DB.Select.Artist, Error>> {
    const operation = async () => await db
        .insert(artists)
        .values(artist)
        .returning();

    // Only insert one artist, so only take the first returned value
    return (await Result.safe(operation())).map((vals) => vals[0] as DB.Select.Artist);
}

async function addArtist(req: Request, res: Response): Promise<void> {
    const artist = req.body as AddArtistRequestBody;

    // TODO : check if artist already exists and return it instead of creating a new one

    const dbResult = (await createArtist(artist))
        .mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to create artist in database: ${err}`));

    sendResult(dbResult, res);
}

async function getArtistsIDFromName(name: string): Promise<Result<number[], Error>> {
    // TODO : add support for incomplete name ? "LIKE" operators with  % and _ ?
    const operation = async () => (await db.select().from(artists).where(eq(artists.name, name))).map(r => r.id);
    const queryResult = Result.safe(operation());

    return queryResult;
}

async function searchIDFromName(req: Request, res: Response): Promise<void> {
    const body = req.body as GetArtistIDByNameBody;

    const ids = (await getArtistsIDFromName(body.name))
        .mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to search artist in database: ${err}`));

    sendResult(ids, res);
}


const artistApiRouter = Router();

artistApiRouter.post("/searchIDFromName", ensureAuthMiddleware, searchIDFromName);
artistApiRouter.post("/add", ensureAuthMiddleware, addArtist);

export { artistApiRouter };