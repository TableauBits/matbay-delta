import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { artists } from "./artist";
import { songs } from "./song";

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

// An entry in the songArtist table only references one song and one artist
const songArtistRelation = relations(songArtist, ({ one }) => ({
    song: one(songs, { fields: [songArtist.song], references: [songs.id] }),
    artist: one(artists, { fields: [songArtist.artist], references: [artists.id] }),
}));

export { songArtist, songArtistRelation };
