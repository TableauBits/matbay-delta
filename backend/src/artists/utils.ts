import { eq } from "drizzle-orm";
import { Option, Result } from "oxide.ts";
import { db } from "../db/http";
import type { DB } from "../db-namepsace";
import { artists } from "../songs/schema";

async function createArtist(artist: DB.Insert.Artist): Promise<Result<DB.Select.Artist, Error>> {
    const operation = async () => await db.insert(artists).values(artist).returning();

    // Only insert one artist, so only take the first returned value
    return (await Result.safe(operation())).map((vals) => vals[0] as DB.Select.Artist);
}

async function getArtist(id: number): Promise<Result<DB.Select.Artist, Error>> {
    const operation = async () => await db.select().from(artists).where(eq(artists.id, id));
    
    const queryResult = await Result.safe(operation());
    if (queryResult.isErr()) return queryResult;
    
    return Option(queryResult.unwrap().at(0)).okOr(new Error(`No artist with id: ${id}`));
}

async function getArtistsIDFromName(name: string): Promise<Result<number[], Error>> {
    // TODO : add support for incomplete name ? "LIKE" operators with  % and _ ?
    const operation = async () => (await db.select().from(artists).where(eq(artists.name, name))).map((r) => r.id);

    return Result.safe(operation());
}

export { createArtist, getArtist, getArtistsIDFromName };
