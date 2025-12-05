import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { songs } from "./song";

const songSource = sqliteTable(
    "songSource",
    {
        id: integer("id").primaryKey(),
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
    (t) => [unique().on(t.song, t.sourceID, t.platform)],
);

// A row of the songSource table only references one song
const songSourceRelation = relations(songSource, ({ one }) => ({
    song: one(songs, { fields: [songSource.song], references: [songs.id] }),
}));

export { songSource, songSourceRelation };
