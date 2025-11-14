import { type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/http";
import type { DB } from "../db-namepsace";
import { Option, None, Result, Some } from "oxide.ts";
import { db } from "../db/http";
import { artists, songArtist, songs } from "./schema";
import { ArtistContributions, type AddArtistRequestBody, type AddSongRequestBody, type GetArtistIDByNameBody } from "../../../common/song";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { eq } from "drizzle-orm";

type Transaction = Parameters<Parameters<typeof db["transaction"]>[0]>[0];

async function createArtist(artist: DB.Insert.Artist): Promise<Result<DB.Select.Artist, Error>> {
    const operation = async () => await db
        .insert(artists)
        .values(artist)
        .returning();

    // Only insert one artist, so only take the first returned value
    return (await Result.safe(operation())).map((vals) => vals[0] as DB.Select.Artist);
}

async function createSong(song: DB.Insert.Song): Promise<Result<DB.Select.Song, Error>> {
    // TODO: figure out transactions, this shit aint working
    // TODO: lock in
    const transactionResult = db.transaction(async (tx) => {
        const operation = async () =>
            await tx
                .insert(songs)
                .values(song)
                .returning();

        const insertResult = (await Result.safe(operation())).map((vals) => vals[0] as DB.Select.Song);
        if (insertResult.isErr()) {
            return insertResult;
        }
        const songData = insertResult.unwrap();
        linkSongToArtists(songData.id, [[songData.primaryArtist, ArtistContributions.MAIN]], tx);
        return insertResult;
    })

    return transactionResult;
}

async function linkSongToArtists(song: number, artists: [number, ArtistContributions][], tx?: Transaction) {
    const ctx = tx ? tx : db;
    const rows = artists.map(([artist, contribution]) => { return { song, artist, contribution } as DB.Insert.SongArtist });
    const operation = async () => await ctx.insert(songArtist).values(rows).returning();

    return await Result.safe(operation());
}

async function addSong(req: Request, res: Response): Promise<void> {
    const song = req.body as AddSongRequestBody;
    const dbResult = (await createSong(song)).mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to create song in database: ${err}`));

    sendResult(
        dbResult,
        res
    );
}

async function addArtist(req: Request, res: Response): Promise<void> {
    const artist = req.body as AddArtistRequestBody;

    // TODO : check if artist already exists and return it instead of creating a new one

    const dbResult = (await createArtist(artist))
        .mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to create artist in database: ${err}`));

    sendResult(dbResult, res);
}

async function searchArtistFromName(name: string): Promise<Result<number[], Error>> {
    // TODO : add support for incomplete name ? "LIKE" operators with  % and _ ?
    const operation = async () => (await db.select().from(artists).where(eq(artists.name, name))).map(r => r.id);
    const queryResult = Result.safe(operation());

    return queryResult;
}

async function getArtistFromName(req: Request, res: Response): Promise<void> {
    const body = req.body as GetArtistIDByNameBody;

    const ids = (await searchArtistFromName(body.name))
        .mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to search artist in database: ${err}`));

    sendResult(ids, res);
}

const artistApiRouter = Router();
artistApiRouter.use("/getArtistIDFromName", ensureAuthMiddleware, getArtistFromName)
artistApiRouter.use("/addArtist", ensureAuthMiddleware, addArtist);

const songApiRouter = Router();
songApiRouter.use("/addSong", ensureAuthMiddleware, addSong);  // TODO : route name ?

export { artistApiRouter, songApiRouter };