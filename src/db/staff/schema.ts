import { serial, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const staff = pgTable("staff", {
    id: serial("id").primaryKey(),
    nome: varchar("nome").notNull()
})

export type StaffMember = typeof staff.$inferSelect
export type StaffMemberInsert = typeof staff.$inferInsert