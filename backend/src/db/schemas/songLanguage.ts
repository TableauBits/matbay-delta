import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { songs } from "./song";

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

export { songLanguage }