import { and, eq } from "drizzle-orm";
import { Option, Result } from "oxide.ts";
import { ArtistContributions } from "../../../common/song";
import { db } from "../db/http";
import type { DB } from "../db-namepsace";
import { songArtist, songs } from "./schema";

type Transaction = Parameters<Parameters<(typeof db)["transaction"]>[0]>[0];

async function createSong(song: DB.Insert.Song, additionalArtists: [number, ArtistContribution][]): Promise<Result<DB.Select.Song, Error>> {
    const transactionResult = db.transaction(async (tx) => {
        // Insert new song in table
        const operation = async () => await tx.insert(songs).values(song).returning();
        const insertResult = (await Result.safe(operation())).map((vals) => vals[0] as DB.Select.Song);

        // Return an error if the insert failed
        if (insertResult.isErr()) return insertResult;

        const songData = insertResult.unwrap();

        // Add a link between the song and the primary artist
        const artistLinks: [number, ArtistContribution][] = [[songData.primaryArtist, ArtistContribution.MAIN], ...additionalArtists];
        linkSongToArtists(songData.id, artistLinks, tx);
        return insertResult;
    });

    return transactionResult;
}

async function getSong(id: number): Promise<Result<DB.Select.Song, Error>> {
    const operation = async () => await db.select().from(songs).where(eq(songs.id, id));

    const queryResult = await Result.safe(operation());
    if (queryResult.isErr()) return queryResult;

    return Option(queryResult.unwrap().at(0)).okOr(new Error(`No song with id: ${id}`));
}

async function searchSong(title: string, aid: number): Promise<Result<number[], Error>> {
    const operation = async () =>
        (
            await db
                .select()
                .from(songs)
                .where(and(eq(songs.title, title), eq(songs.primaryArtist, aid)))
        ).map((r) => r.id);

    return Result.safe(operation());
}

async function linkSongToArtists(song: number, artists: [number, ArtistContribution][], tx?: Transaction) {
    const ctx = tx ? tx : db;
    const rows = artists.map(([artist, contribution]) => {
        return { song, artist, contribution } as DB.Insert.SongArtist;
    });
    const operation = async () => await ctx.insert(songArtist).values(rows).returning();

    // TODO : Return value necessary ?
    return await Result.safe(operation());
}

export { createSong, getSong, searchSong };
