import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { artistAlbum } from "./artistAlbum";
import { songArtist } from "./songArtist";
import { artistCountry } from "./artistCountry";

const artists = sqliteTable("artists", {
    id: integer("id").primaryKey(),
    creationDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    name: text().notNull(),
});

const artistsRelations = relations(artists, ({ many }) => ({
    artistAlbum: many(artistAlbum), // One artist can participate in multiple albums
    songArtist: many(songArtist), // One artist can have multiple song contributions
    artistCountry: many(artistCountry), // One artist can be associated with multiple countries
}));

export { artists, artistsRelations };
