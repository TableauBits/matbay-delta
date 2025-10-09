import { relations } from "drizzle-orm/relations";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "../user/schema";
import { songs } from "../songs/schema";

/// Tables
/// Constitutions table
const constitutions = sqliteTable("constitutions", {
    id: integer("id").primaryKey(),
    creationDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),

    name: text().notNull(),
    description: text().notNull(),
    owner: text().references(() => users.id),
});

/// Relations
/// user <==> constitution
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
/// A user can participate in many constitutions
const userToConstitution = relations(users, ({ many }) => ({
    userConstitution: many(userConstitution),
}));

/// A constitution can have many participating users
const constitutionToUser = relations(constitutions, ({ many }) => ({
    userConstitution: many(userConstitution),
}));

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

/// song <==> constitution
const songConstitution = sqliteTable("songConstitution", {
    id: integer("id").primaryKey(),

    url: text().notNull(),
    song: text()
        .notNull()
        .references(() => songs.id),
    user: text()
        .notNull()
        .references(() => users.id),
    constitution: integer()
        .notNull()
        .references(() => constitutions.id),
    addDate: text()
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
}, (t) => [unique().on(t.song, t.user, t.constitution)]);

/// One song can be added to many constitutions
const songToConstitution = relations(songs, ({ many }) => ({
    songConstitution: many(songConstitution),
}));

/// One constitution can have many participating songs
const constitutionToSong = relations(constitutions, ({ many }) => ({
    songConstitution: many(songConstitution),
}));

/// A row in songConstitution table only references one song and one constitution
const songConstitutionRelation = relations(songConstitution, ({ one }) => ({
    song: one(songs, {fields: [songConstitution.song], references: [songs.id]}),
    user: one(users, {fields: [songConstitution.user], references: [users.id]}),
    constitution: one(constitutions, {fields: [songConstitution.constitution], references: [constitutions.id]}),
}));

export {
    constitutions,
    userConstitution,
    userToConstitution,
    constitutionToUser,
    userConstitutionRelation,
    songConstitution,
    songToConstitution,
    constitutionToSong,
    songConstitutionRelation
};
