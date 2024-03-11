import { PgTable, numeric, pgTable, serial, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    mail: text("mail").notNull().unique(),
    nome: text("nome").notNull(),
    cognome: text("cognome").notNull(),
    password: text("password").notNull()
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

