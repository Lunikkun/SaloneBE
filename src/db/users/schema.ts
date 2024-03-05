import { PgTable, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().notNull(),
    nome: text("nome").notNull(),
    cognome: text("cognome").notNull(),
    mail: text("mail").notNull(),
    password: text("password").notNull()
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

