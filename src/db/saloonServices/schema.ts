
import { integer } from "drizzle-orm/pg-core";
import { numeric, pgTable, serial, text } from "drizzle-orm/pg-core";

export const saloonServices = pgTable("saloonServices", {
    id: serial("id").primaryKey(),
    nome: text("nome").notNull(),
    durata : integer("durata").notNull(),
    prezzo: numeric("prezzo").notNull(),
    descrizione : text("descrizione"),
});

export type InsertService = typeof saloonServices.$inferInsert;
export type Service = typeof saloonServices.$inferSelect;