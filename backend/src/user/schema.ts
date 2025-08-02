import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const usersTable = sqliteTable("users", {
    id: text().primaryKey(),
    username: text().notNull(),
    imageURL: text().notNull(),
    joinDate: text().notNull(),
    description: text().notNull(),
});
