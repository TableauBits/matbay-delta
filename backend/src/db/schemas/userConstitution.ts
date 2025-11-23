import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { constitutions } from "./constitution";
import { users } from "./user";

const userConstitution = sqliteTable(
    "userConstitution",
    {
        id: integer("id").primaryKey(),

        user: text()
            .notNull()
            .references(() => users.id),
        constitution: integer()
            .notNull()
            .references(() => constitutions.id),
        joinDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
    },
    (t) => [unique().on(t.user, t.constitution)],
);

/// A constitution participation links one user to one constitution
const userConstitutionRelation = relations(userConstitution, ({ one }) => ({
    user: one(users, {
        fields: [userConstitution.user],
        references: [users.id],
    }),
    constitution: one(constitutions, {
        fields: [userConstitution.constitution],
        references: [constitutions.id],
    }),
}));

export { userConstitution, userConstitutionRelation };
