import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { songAlbum } from "./songAlbum";
import { artistAlbum } from "./artistAlbum";

const albums = sqliteTable("albums", {
    id: integer("id").primaryKey(),
    creationDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    title: text().notNull(),
});

const albumsRelations = relations(albums, ({one, many}) => ({
    artistAlbum: many(artistAlbum),     // One album can feature multiple artists
    songAlbum: many(songAlbum)
}));

export { albums, albumsRelations }