import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { songs } from "./song";

const songLanguage = sqliteTable(
    "songLanguage",
    {
        creationDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),

        song: integer()
            .notNull()
            .references(() => songs.id),
        language: text().notNull(),
    },
    (t) => [primaryKey({ columns: [t.song, t.language] })],
);

// A row of the songSource table only references one song
const songLanguageRelation = relations(songLanguage, ({ one }) => ({
    song: one(songs, { fields: [songLanguage.song], references: [songs.id] }),
}));

export { songLanguage, songLanguageRelation };
