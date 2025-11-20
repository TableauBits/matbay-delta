import { relations } from "drizzle-orm";
import { integer, sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { songs } from "./song";
import { albums } from "./album";

const songAlbum = sqliteTable(
    "songAlbum",
    {
        id: integer("id").primaryKey(),

        song: integer()
            .notNull()
            .references(() => songs.id),
        album: integer()
            .notNull()
            .references(() => albums.id),
    },
    (t) => [unique().on(t.song, t.album)],
);

// An entry in the songAlbum table only references one song and one album
const songAlbumRelation = relations(songAlbum, ({ one }) => ({
    song: one(songs, { fields: [songAlbum.song], references: [songs.id] }),
    album: one(albums, { fields: [songAlbum.album], references: [albums.id] }),
}));

export { songAlbum, songAlbumRelation };