import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { artists } from "./artist";
import { songs } from "./song";

const songArtist = sqliteTable(
    "songArtist",
    {
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
    (t) => [primaryKey({ columns: [t.song, t.artist, t.contribution] })],
);

// An entry in the songArtist table only references one song and one artist
const songArtistRelation = relations(songArtist, ({ one }) => ({
    song: one(songs, { fields: [songArtist.song], references: [songs.id] }),
    artist: one(artists, { fields: [songArtist.artist], references: [artists.id] }),
}));

export { songArtist, songArtistRelation };
