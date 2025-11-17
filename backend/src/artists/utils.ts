import { eq } from "drizzle-orm";
import { Result } from "oxide.ts";
import { db } from "../db/http";
import type { DB } from "../db-namepsace";
import { artists } from "../songs/schema";

async function createArtist(artist: DB.Insert.Artist): Promise<Result<DB.Select.Artist, Error>> {
    const operation = async () => await db.insert(artists).values(artist).returning();

    // Only insert one artist, so only take the first returned value
    return (await Result.safe(operation())).map((vals) => vals[0] as DB.Select.Artist);
}

async function getArtistsIDFromName(name: string): Promise<Result<number[], Error>> {
    // TODO : add support for incomplete name ? "LIKE" operators with  % and _ ?
    const operation = async () => (await db.select().from(artists).where(eq(artists.name, name))).map((r) => r.id);

    return Result.safe(operation());
}

export { createArtist, getArtistsIDFromName };
