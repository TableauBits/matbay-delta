import { relations } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { userArtistShowcase } from "./userArtistShowcase";
import { userConstitution } from "./userConstitution";
import { userSongShowcase } from "./userSongShowcase";

const users = sqliteTable(
    "users",
    {
        id: text().primaryKey(),
        authID: text().notNull(),
        handle: text().notNull(),
        displayName: text().notNull(),
        imageURL: text().notNull(),
        bannerURL: text(),
        joinDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
        description: text().notNull(),
    },
    (table) => [uniqueIndex("authID_idx").on(table.authID), uniqueIndex("handle_idx").on(table.handle)],
);

const usersRelations = relations(users, ({ many }) => ({
    userConstitution: many(userConstitution), // A user can participate in many constitutions
    songShowcase: many(userSongShowcase), // A user can showcase multiple songs
    artistShowcase: many(userArtistShowcase), // A user can showcase multiple artists
}));

export { users, usersRelations };
