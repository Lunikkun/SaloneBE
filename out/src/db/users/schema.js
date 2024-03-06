import { pgTable, text } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
    mail: text("mail").notNull().unique().primaryKey(),
    nome: text("nome").notNull(),
    cognome: text("cognome").notNull(),
    password: text("password").notNull()
    //AUTO INCREMENT ID SERIAL NON VA 
});
