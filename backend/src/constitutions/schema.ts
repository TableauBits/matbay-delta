import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
const userConstitutionParticipation = sqliteTable(
    "userConstitutionParticipation",
    {
        id: integer('id').primaryKey(),
        user: text().notNull().references(() => users.id),
        constitution: integer().notNull().references(() => constitutions.id),
        joinDate: text().notNull().$defaultFn(() => new Date().toISOString()),
    }
);

// Relations
/// A user can participate in many constitutions
const usersRelations = relations(users, ({ many }) => ({
    userConstitutionParticipation: many(userConstitutionParticipation)
}));

/// A constitution can have many participating users
const constitutionRelations = relations(constitutions, ({ many }) => ({
    userConstitutionParticipation: many(userConstitutionParticipation)
}));

const userConstitutionParticipationRelation = relations(userConstitutionParticipation, ({ one }) => ({
    user: one(users, {
        fields: [userConstitutionParticipation.user],
        references: [users.id]
    }),
    constitution: one(constitutions, {
        fields: [userConstitutionParticipation.constitution],
        references: [constitutions.id]
    })
}));

export {
    constitutions,
    userConstitutionParticipation,
    usersRelations,
    constitutionRelations,
    userConstitutionParticipationRelation
};