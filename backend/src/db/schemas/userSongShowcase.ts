import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { songs } from "./song";
import { users } from "./user";

const userSongShowcase = sqliteTable(
    "userSongShowcase",
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
);

const userSongShowcaseRelation = relations(userSongShowcase, ({ one }) => ({
    user: one(users, { fields: [userSongShowcase.user], references: [users.id] }),
    song: one(songs, { fields: [userSongShowcase.song], references: [songs.id] }),
}));

export { userSongShowcase, userSongShowcaseRelation };
