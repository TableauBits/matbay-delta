import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { songs } from "./song";
import { relations } from "drizzle-orm";

const songLanguage = sqliteTable(
    "songLanguage",
    {
        id: integer("id").primaryKey(),
        creationDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
        
        song: integer()
            .notNull()
            .references(() => songs.id),
        language: text().notNull()
    },
    (t) => [unique().on(t.song, t.language)],
)

// A row of the songSource table only references one song
const songLanguageRelation = relations(songLanguage, ({ one }) => ({
    song: one(songs, { fields: [songLanguage.song], references: [songs.id] }),
}));


export { songLanguage, songLanguageRelation }