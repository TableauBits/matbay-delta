import { and, eq } from "drizzle-orm";
import { Err, Option, Result } from "oxide.ts";
import parseUrl from "parse-url";
import { ArtistContribution } from "../../../common/artist";
import type { Song } from "../../../common/song";
import { KNOWN_HOSTS, SourceHost, SourcePlatform } from "../../../common/source";
import { db } from "../db/http";
import { songArtist, songSource, songs } from "../db/schemas";
import type { DB } from "../db-namepsace";
import { unwrap } from "../utils";

type Transaction = Parameters<Parameters<(typeof db)["transaction"]>[0]>[0];

async function addSong(
    song: DB.Insert.Song,
    additionalArtists: [number, ArtistContribution][],
    sources: string[],
): Promise<Result<DB.Select.Song, Error>> {
    return Result.safe(
        db.transaction(async (tx) => {
            // Insert new song in table
            const songData = unwrap(await createSong(song, tx));

            // Add a link between the song and the artists
            const artistLinks: [number, ArtistContribution][] = [
                [songData.primaryArtist, ArtistContribution.MAIN],
                ...additionalArtists,
            ];
            unwrap(await linkSongToArtists(songData.id, artistLinks, tx));

            // Creates sources of the song
            unwrap(await createSources(songData.id, sources, tx));

            return songData;
        }),
    );
}

async function createSong(song: DB.Insert.Song, tx?: Transaction): Promise<Result<DB.Select.Song, Error>> {
    const ctx = tx ? tx : db;
    const operation = async () => await ctx.insert(songs).values(song).returning();

    // Only insert one song, so only take the first returned value
    return (await Result.safe(operation())).andThen((artists) =>
        Option(artists.at(0)).okOr(new Error("failed to add song to database")),
    );
}

async function getSong(id: number): Promise<Result<Song, Error>> {
    // Get the song with the specified id with :
    // - The list of contributing artists (the artist id and the contribution type)
    // - The list of sources (the source original id and platform)
    const operation = async () =>
        await db.query.songs.findMany({
            where: eq(songs.id, id),
            with: {
                songArtist: {
                    columns: {
                        artist: true,
                        contribution: true,
                    },
                },
                songSource: {
                    columns: {
                        sourceID: true,
                        platform: true,
                    },
                },
            },
        });

    return (await Result.safe(operation())).andThen((val) =>
        Option(val.at(0)).okOr(new Error(`No song with id: ${id}`)),
    );
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

function getSourceInfo(source: parseUrl.ParsedUrl, host: SourceHost) {
    switch (host) {
        case SourceHost.YOUTUBE:
            return Option(source.query["v"])
                .map((sourceID) => {
                    return { sourceID, platform: SourcePlatform.YOUTUBE };
                })
                .okOr(new Error("invalid URL for host"));
        case SourceHost.YOUTU_BE:
            return Option(source.pathname.split("/").at(-1))
                .map((sourceID) => {
                    return { sourceID, platform: SourcePlatform.YOUTUBE };
                })
                .okOr(new Error("invalid URL for host"));
        default:
            return Err(new Error("invalid host"));
    }
}

async function createSources(
    song: number,
    sources: string[],
    tx?: Transaction,
): Promise<Result<DB.Select.SongSource[], Error>> {
    const ctx = tx ? tx : db;

    const rows = Result.all(
        ...sources.map((sourceURL) => {
            const source = parseUrl(sourceURL, true);

            return Option(KNOWN_HOSTS.get(source.host))
                .okOr(new Error("unknown host"))
                .andThen((host: SourceHost) => {
                    return getSourceInfo(source, host);
                })
                .map((sourceInfo) => {
                    return { ...sourceInfo, song };
                });
        }),
    );
    if (rows.isErr()) return rows;

    const operation = async () => await ctx.insert(songSource).values(rows.unwrap()).returning();

    return await Result.safe(operation());
}

async function linkSongToArtists(
    song: number,
    artists: [number, ArtistContribution][],
    tx?: Transaction,
): Promise<Result<DB.Select.SongArtist[], Error>> {
    const ctx = tx ? tx : db;
    const rows = artists.map(([artist, contribution]) => {
        return { song, artist, contribution } as DB.Insert.SongArtist;
    });
    const operation = async () => await ctx.insert(songArtist).values(rows).returning();

    return await Result.safe(operation());
}

export { addSong, getSong, searchSong };
