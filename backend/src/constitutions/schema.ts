import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "../user/schema";
import { relations } from "drizzle-orm/relations";

// Tables
/// Constitutions table
const constitutions = sqliteTable(
    "constitutions",
    {
        id: integer('id').primaryKey(),  // TODO : Primary key ==> use a UUID string instead ?
        name: text().notNull(),
        description: text().notNull(),
        owner: text().references(() => users.id),
        creationDate: text().notNull().$defaultFn(() => new Date().toISOString()),
    },
);

/// User participation in constitutions table
const userConstitution = sqliteTable(
    "userConstitution",
    {
        id: integer('id').primaryKey(),
        user: text().notNull().references(() => users.id),
        constitution: integer().notNull().references(() => constitutions.id),
        joinDate: text().notNull().$defaultFn(() => new Date().toISOString()),
    }, (t) => [
        unique().on(t.user, t.constitution)
    ]
    
);

// Relations
/// A user can participate in many constitutions
const usersRelations = relations(users, ({ many }) => ({
    userConstitution: many(userConstitution)
}));

/// A constitution can have many participating users
const constitutionRelations = relations(constitutions, ({ many }) => ({
    userConstitution: many(userConstitution)
}));

const userConstitutionRelation = relations(userConstitution, ({ one }) => ({
    user: one(users, {
        fields: [userConstitution.user],
        references: [users.id]
    }),
    constitution: one(constitutions, {
        fields: [userConstitution.constitution],
        references: [constitutions.id]
    })
}));

export {
    constitutions,
    userConstitution,
    usersRelations,
    constitutionRelations,
    userConstitutionRelation
};