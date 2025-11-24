import { relations } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { userConstitution } from "./userConstitution";

const users = sqliteTable(
    "users",
    {
        id: text().primaryKey(),
        authID: text().notNull(),
        username: text().notNull(),
        displayName: text().notNull(),
        imageURL: text().notNull(),
        joinDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
        description: text().notNull(),
    },
    (table) => [uniqueIndex("authID_idx").on(table.authID), uniqueIndex("username_idx").on(table.username)],
);

const usersRelations = relations(users, ({ many }) => ({
    userConstitution: many(userConstitution), // A user can participate in many constitutions
}));

export { users, usersRelations };
