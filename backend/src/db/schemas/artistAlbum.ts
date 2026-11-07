import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { albums } from "./album";
import { artists } from "./artist";

/// artist <==> album
const artistAlbum = sqliteTable(
    "artistAlbum",
    {
        artist: integer()
            .notNull()
            .references(() => artists.id),
        album: integer()
            .notNull()
            .references(() => albums.id),
    },
    (t) => [primaryKey({ columns: [t.artist, t.album] })],
);

// An entry in the artistAlbum table only references one artist and one album
const artistAlbumRelation = relations(artistAlbum, ({ one }) => ({
    artist: one(artists, { fields: [artistAlbum.artist], references: [artists.id] }),
    album: one(albums, { fields: [artistAlbum.album], references: [albums.id] }),
}));

export { artistAlbum, artistAlbumRelation };
