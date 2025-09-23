import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "../user/schema";
import { relations } from "drizzle-orm/relations";

const constitutionsTable = sqliteTable(
    "constitutions",
    {
        id: text().primaryKey(),
        name: text().notNull(),
        description: text().notNull(),
        owner: text().references(() => usersTable.id),
        creationDate: text().notNull().$defaultFn(() => new Date().toISOString()),
    },
);

const userConstitutionParticipation = sqliteTable(
    "userConstitutionParticipation",
    {
        id: text().primaryKey(),
        user: text().notNull().references(() => usersTable.id),
        constitution: text().notNull().references(() => constitutionsTable.id),
        joinDate: text().notNull()
    }
)

const usersRelations = relations(usersTable, ({many}) => ({
    userConstitutionParticipation: many(userConstitutionParticipation)
})) 

const constitutionRelations = relations(constitutionsTable, ({many}) => ({
    userConstitutionParticipation: many(userConstitutionParticipation)
})) 

const userConstitutionParticipationRelation = relations(userConstitutionParticipation, ({one}) => ({
    user: one(usersTable, {
        fields: [userConstitutionParticipation.user],
        references: [usersTable.id]
    }),
    constitution: one(constitutionsTable, {
        fields: [userConstitutionParticipation.constitution],
        references: [constitutionsTable.id]
    })
}))


export {
    constitutionsTable,
    userConstitutionParticipation,
    usersRelations,
    constitutionRelations,
    userConstitutionParticipationRelation
};