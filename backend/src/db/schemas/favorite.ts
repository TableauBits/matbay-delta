import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "./user";
import { songConstitution } from "./songConstitution";
import { relations } from "drizzle-orm";

const favorite = sqliteTable(
  "favorite",
  {
    id: integer("id").primaryKey(),
    creationDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    user: text()
        .notNull()
        .references(() => users.id),
    songConstitution: integer()
        .notNull()
        .references(() => songConstitution.id),
  },
  (t) => [unique().on(t.user, t.songConstitution)], // A user can only favorite a songConstitution once
);

// A favorite links one user to one songConstitution
const favoriteRelation = relations(favorite, ({ one }) => ({
    user: one(users, { fields: [favorite.user], references: [users.id] }),
    songConstitution: one(songConstitution, { fields: [favorite.songConstitution], references: [songConstitution.id] }),
}));

export { favorite, favoriteRelation };