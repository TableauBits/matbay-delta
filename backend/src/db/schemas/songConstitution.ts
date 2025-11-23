import { relations } from "drizzle-orm/relations";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { constitutions } from "./constitution";
import { songs } from "./song";
import { users } from "./user";

const songConstitution = sqliteTable(
    "songConstitution",
    {
        id: integer("id").primaryKey(),

        // url: text().notNull(),
        song: integer()
            .notNull()
            .references(() => songs.id),
        user: text()
            .notNull()
            .references(() => users.id),
        constitution: integer()
            .notNull()
            .references(() => constitutions.id),
        addDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
    },
    (t) => [unique().on(t.song, t.user, t.constitution)],
);

/// A row in songConstitution table only references one song and one constitution
const songConstitutionRelation = relations(songConstitution, ({ one }) => ({
    song: one(songs, { fields: [songConstitution.song], references: [songs.id] }),
    user: one(users, { fields: [songConstitution.user], references: [users.id] }),
    constitution: one(constitutions, { fields: [songConstitution.constitution], references: [constitutions.id] }),
}));

export { songConstitution, songConstitutionRelation };
