import { type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/http";
import type { DB } from "../db-namepsace";
import { Result } from "oxide.ts";
import { db } from "../db/http";
import { songArtist, songs } from "./schema";
import { ArtistContributions, type AddSongRequestBody } from "../../../common/song";
import { HttpError, HttpStatus, sendResult } from "../utils";


type Transaction = Parameters<Parameters<typeof db["transaction"]>[0]>[0];

async function createSong(song: DB.Insert.Song): Promise<Result<DB.Select.Song, Error>> {
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

const songApiRouter = Router();
songApiRouter.use("/addSong", ensureAuthMiddleware, addSong);  // TODO : route name ?

export { songApiRouter };