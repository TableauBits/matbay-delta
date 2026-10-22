import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { artists } from "./artist";

const artistCountry = sqliteTable(
    "artistCountry",
    {
        id: integer("id").primaryKey(),
        creationDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
        
        artist: integer()
            .notNull()
            .references(() => artists.id),
        country: text().notNull(),
    },
    (t) => [unique().on(t.artist, t.country)],
);

// A row of the artistCountry table only references one artist
const artistCountryRelation = relations(artistCountry, ({ one }) => ({
    artist: one(artists, { fields: [artistCountry.artist], references: [artists.id] }),
}));

export { artistCountry, artistCountryRelation };