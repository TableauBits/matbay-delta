import { eq, like } from "drizzle-orm";
import { Err, Option, Result } from "oxide.ts";
import parseUrl from "parse-url";
import { ArtistContribution } from "../../../common/artist";
import type { AddSongRequestBody, Song } from "../../../common/song";
import { KNOWN_HOSTS, type Source, SourceHost, SourcePlatform } from "../../../common/source";
import { db } from "../db/http";
import { songArtist, songConstitution, songLanguage, songSource, songs } from "../db/schemas";
import type { DB } from "../db-namespace";
import { unwrap } from "../utils";

async function addSong(body: AddSongRequestBody): Promise<Result<DB.Select.Song, Error>> {
    return Result.safe(
        // Bun SQLite transactions must finish synchronously to roll back on errors.
        () =>
            db.transaction((tx) => {
                // Insert new song in table
                const songData = unwrap(createSong(body.song, tx));

                // Add a link between the song and the artists
                const artistLinks: [number, ArtistContribution][] = [
                    [songData.primaryArtist, ArtistContribution.MAIN],
                    ...body.otherContributions,
                ];
                unwrap(linkSongToArtists(songData.id, artistLinks, tx));

                // Creates sources of the song
                if (body.sources.length !== 0) {
                    unwrap(createSources(songData.id, body.sources, tx));
                }

                // Create languages of the song
                if (body.languages.length !== 0) {
                    unwrap(createLanguagesForSong(songData.id, body.languages, tx));
                }

                return songData;
            }),
    );
}

function createLanguagesForSong(song: number, languages: string[], tx?: DB.Transaction): Result<void, Error> {
    const ctx = tx ? tx : db;

    const rows = languages.map((l) => {
        const row: DB.Insert.SongLanguage = { song, language: l };
        return row;
    });

    const operation = () => {
        ctx.insert(songLanguage).values(rows).run();
    };

    return Result.safe(operation);
}

function createSong(song: DB.Insert.Song, tx?: DB.Transaction): Result<DB.Select.Song, Error> {
    const ctx = tx ? tx : db;
    const operation = () => ctx.insert(songs).values(song).returning().all();

    // Only insert one song, so only take the first returned value
    return Result.safe(operation).andThen((artists) =>
        Option(artists.at(0)).okOr(new Error("failed to add song to database")),
    );
}

async function getSong(id: number): Promise<Result<Song, Error>> {
    // Get the song with the specified id with :
    // - The list of contributing artists (the artist id and the contribution type)
    // - The list of sources (the source original id and platform)
    // - The list of languages
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
                songLanguage: {
                    columns: {
                        language: true,
                    },
                },
            },
        });

    return (await Result.safe(operation())).andThen(
        (val) =>
            Option(val.at(0))
                .map((v) => ({ ...v, songLanguage: v.songLanguage.map((l) => l.language) }))
                .okOr(new Error(`No song with id: ${id}`)), // God have mercy, i didn't mean it
    );
}

async function searchSongsByTitle(query: string): Promise<Result<DB.Select.Song[], Error>> {
    const operation = async () =>
        await db
            .select()
            .from(songs)
            .where(like(songs.title, `%${query}%`));

    return Result.safe(operation());
}

function getSourceInfo(source: parseUrl.ParsedUrl, host: SourceHost): Result<Source, Error> {
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

function createSources(song: number, sources: string[], tx?: DB.Transaction): Result<DB.Select.SongSource[], Error> {
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

    const operation = () => ctx.insert(songSource).values(rows.unwrap()).returning().all();

    return Result.safe(operation);
}

function linkSongToArtists(
    song: number,
    artists: [number, ArtistContribution][],
    tx?: DB.Transaction,
): Result<DB.Select.SongArtist[], Error> {
    const ctx = tx ? tx : db;
    const rows = artists.map(([artist, contribution]) => {
        return { song, artist, contribution } as DB.Insert.SongArtist;
    });
    const operation = () => ctx.insert(songArtist).values(rows).returning().all();

    return Result.safe(operation);
}

async function getSongConstitution(song: number): Promise<Result<DB.Select.SongConstitution[], Error>> {
    const operation = async () => await db.select().from(songConstitution).where(eq(songConstitution.song, song));

    return await Result.safe(operation());
}

export { addSong, getSong, getSongConstitution, searchSongsByTitle };
