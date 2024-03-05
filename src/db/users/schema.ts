import { PgTable, numeric, pgTable, serial, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    
    mail: text("mail").notNull().unique(),
    nome: text("nome").notNull(),
    cognome: text("cognome").notNull(),
    password: text("password").notNull()
    //AUTO INCREMENT ID SERIAL NON VA 
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

