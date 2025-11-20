import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user";
import { relations } from "drizzle-orm";
import { songConstitution } from "./songConstitution";
import { userConstitution } from "./userConstitution";

const constitutions = sqliteTable("constitutions", {
    id: integer("id").primaryKey(),
    creationDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    name: text().notNull(),
    description: text().notNull(),
    owner: text().references(() => users.id),
});

const constitutionsRelations = relations(constitutions, ({ one, many }) => ({
    songConstitution: many(songConstitution),
    userConstitution: many(userConstitution),     // A constitution can have many participating users
}));

export { constitutions, constitutionsRelations };