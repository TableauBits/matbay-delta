import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "./user";
import { songs } from "./song";
import { relations } from "drizzle-orm";

const userSongFavorite = sqliteTable(
    "userSongFavorite",
    {
        id: integer("id").primaryKey(),
        user: text()
            .notNull()
            .references(() => users.id),
        song: integer()
            .notNull()
            .references(() => songs.id),
        addDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
    },
    (t) => [unique().on(t.user, t.song)],
)

const userSongFavoriteRelation = relations(userSongFavorite, ({ one }) => ({
    user: one(users, { fields: [userSongFavorite.user], references: [users.id] }),
    song: one(songs, { fields: [userSongFavorite.song], references: [songs.id] }),
}));

export { userSongFavorite, userSongFavoriteRelation }