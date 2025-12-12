import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { songConstitution } from "./songConstitution";
import { users } from "./user";
import { userConstitution } from "./userConstitution";

const MAX_SONGS_PER_USER_DEFAULT = 5;

const constitutions = sqliteTable("constitutions", {
    id: integer("id").primaryKey(),
    creationDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    name: text().notNull(),
    description: text().notNull(),
    owner: text().references(() => users.id),
    nSongs: integer().default(MAX_SONGS_PER_USER_DEFAULT).notNull(),
});

const constitutionsRelations = relations(constitutions, ({ many }) => ({
    songConstitution: many(songConstitution), // A constitution have multiple songs
    userConstitution: many(userConstitution), // A constitution have multiple users
}));

export { constitutions, constitutionsRelations };
