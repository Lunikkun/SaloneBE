
import { integer, numeric, pgTable, serial, text, uuid } from "drizzle-orm/pg-core";

export const saloonServices = pgTable("saloonServices", {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    nome: text("nome").notNull(),
    prezzo: numeric("prezzo").notNull(),
    descrizione : text("descrizione"),
});

export type InsertService = typeof saloonServices.$inferInsert;
export type Service = typeof saloonServices.$inferSelect;