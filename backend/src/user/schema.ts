import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
export const usersTable = sqliteTable(
    "users",
    {
        id: text().primaryKey(),
        authID: text().notNull(),
        username: text().notNull(),
        imageURL: text().notNull(),
        joinDate: text().notNull(),
        description: text().notNull(),
    },
    (table) => [uniqueIndex("authID_idx").on(table.authID)],
);
