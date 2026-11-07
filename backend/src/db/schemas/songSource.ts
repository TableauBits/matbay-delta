import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { songs } from "./song";

const songSource = sqliteTable(
    "songSource",
    {
        creationDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),

        song: integer()
            .notNull()
            .references(() => songs.id),
        sourceID: text().notNull(),
        platform: text({ enum: ["YOUTUBE"] }).notNull(),
        // TODO : add a user ?
    },
    (t) => [primaryKey({ columns: [t.song, t.platform, t.sourceID] })],
);

// A row of the songSource table only references one song
const songSourceRelation = relations(songSource, ({ one }) => ({
    song: one(songs, { fields: [songSource.song], references: [songs.id] }),
}));

export { songSource, songSourceRelation };
