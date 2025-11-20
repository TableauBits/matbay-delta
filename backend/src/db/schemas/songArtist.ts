import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { songs } from "./song";
import { artists } from "./artist";
import { relations } from "drizzle-orm";

const songArtist = sqliteTable(
    "songArtist",
    {
        id: integer("id").primaryKey(),

        song: integer()
            .notNull()
            .references(() => songs.id),
        artist: integer()
            .notNull()
            .references(() => artists.id),
        contribution: text({ enum: ["main", "featuring"] })
            .notNull()
            .default("main"),
    },
    (t) => [unique().on(t.artist, t.song, t.contribution)],
);

// // One song can have multiple artists
// const songToArtists = relations(songs, ({ many }) => ({
//     songArtist: many(songArtist),
// }));

// One artist can have multiple song contributions
// const artistToSongs = relations(artists, ({ many }) => ({
//     songArtist: many(songArtist),
// }));

// An entry in the songArtist table only references one song and one artist
const songArtistRelation = relations(songArtist, ({ one }) => ({
    song: one(songs, { fields: [songArtist.song], references: [songs.id] }),
    artist: one(artists, { fields: [songArtist.artist], references: [artists.id] }),
}));

export {
    songArtist,
    // songToArtists,
    // artistToSongs,
    songArtistRelation
}