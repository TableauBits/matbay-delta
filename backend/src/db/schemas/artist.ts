import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { songArtist } from "./songArtist";
import { artistAlbum } from "./artistAlbum";

const artists = sqliteTable("artists", {
    id: integer("id").primaryKey(),
    creationDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    name: text().notNull(),
});

const artistsRelations = relations(artists, ({ one, many }) => ({
    artistAlbum: many(artistAlbum),     // One artist can participate in multiple albums
    songArtist: many(songArtist),       // One artist can have multiple song contributions
}));

export { artists, artistsRelations }