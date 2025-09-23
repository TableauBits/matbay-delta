import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable(
    "users",
    {
        id: text().primaryKey(),
        authID: text().notNull(),
        username: text().notNull(),
        displayName: text().notNull(),
        imageURL: text().notNull(),
        joinDate: text().notNull().$defaultFn(()=>new Date().toISOString()),
        description: text().notNull(),
    },
    (table) => [
        uniqueIndex("authID_idx").on(table.authID),
        uniqueIndex("username_idx").on(table.username)
    ],
);
