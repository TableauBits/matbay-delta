import { eq, like } from "drizzle-orm";
import { Option, Result } from "oxide.ts";
import { db } from "../db/http";
import { artistCountry, artists } from "../db/schemas";
import type { DB } from "../db-namespace";
import type { AddArtistRequestBody, Artist } from "../../../common/artist";
import { unwrap } from "../utils";

async function addArtist(body: AddArtistRequestBody): Promise<Result<DB.Select.Artist, Error>> {
    return Result.safe(
        db.transaction(async (tx) => {
            // Insert new artist
            const artistData = unwrap(await createArtist(body.artist, tx));

            // Create countries for artist
            if (body.countries.length !== 0) {
                createCountriesForArtist(artistData.id, body.countries);
            }

            return artistData;
        }),
    );
}

async function createCountriesForArtist(
    artist: number,
    countries: string[],
    tx?: DB.Transaction
): Promise<Result<void, Error>> {
    const ctx = tx ? tx : db;

    const rows = countries.map(c => {
        const row: DB.Insert.ArtistCountry = { artist, country: c }
        return row;
    });

    const operation = async () => await ctx.insert(artistCountry).values(rows);

    return await Result.safe(operation());
}

async function createArtist(artist: DB.Insert.Artist, tx?: DB.Transaction): Promise<Result<DB.Select.Artist, Error>> {
    const ctx = tx ? tx : db;
    const operation = async () => await ctx.insert(artists).values(artist).returning();

    // Only insert one artist, so only take the first returned value
    return (await Result.safe(operation())).andThen((artists) =>
        Option(artists.at(0)).okOr(new Error("failed to add artist to database")),
    );
}

async function getArtist(id: number): Promise<Result<Artist, Error>> {
    // Get the artist with the specified id with :
    // - The list of countries the artist is associated with
    const operation = async () =>
        await db.query.artists.findFirst({
            where: eq(artists.id, id),
            with: {
                artistCountry: {
                    columns: {
                        country: true,
                    },
                },
            },
        });

    const queryResult = await Result.safe(operation());
    return queryResult.andThen((val) => Option(val)
        .map(v => ({ ...v, countries: v.artistCountry.map(c => c.country) }))
        .okOr(new Error(`No artist with id: ${id}`)));
}

async function searchArtistsByName(query: string): Promise<Result<DB.Select.Artist[], Error>> {
    const operation = async () =>
        await db
            .select()
            .from(artists)
            .where(like(artists.name, `%${query}%`));

    return Result.safe(operation());
}

export { addArtist, getArtist, searchArtistsByName };
