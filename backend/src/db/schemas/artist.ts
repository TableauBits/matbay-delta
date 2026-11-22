import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { artistAlbum } from "./artistAlbum";
import { songArtist } from "./songArtist";
import { userArtistShowcase } from "./userArtistShowcase";

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
    userArtistShowcase: many(userArtistShowcase), // One artist can be favorited by many users
}));

export { artists, artistsRelations };
