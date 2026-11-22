import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { artists } from "./artist";
import { users } from "./user";
import { relations } from "drizzle-orm/relations";

const userArtistShowcase = sqliteTable(
    "userArtistShowcase",
    {
        id: integer("id").primaryKey(),
        user: text()
            .notNull()
            .references(() => users.id),
        artist: integer()
            .notNull()
            .references(() => artists.id),
        addDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
    },
    (t) => [unique().on(t.user, t.artist)],
);

const userArtistShowcaseRelation = relations(userArtistShowcase, ({ one }) => ({
    user: one(users, { fields: [userArtistShowcase.user], references: [users.id] }),
    artist: one(artists, { fields: [userArtistShowcase.artist], references: [artists.id] }),
}));

export { userArtistShowcase, userArtistShowcaseRelation };