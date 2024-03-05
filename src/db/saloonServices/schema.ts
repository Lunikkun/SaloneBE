
import { integer, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const saloonServices = pgTable("saloonServices", {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    prezzo: numeric("prezzo").notNull(),
    descrizione : text("descrizione")
});

export type InsertService = typeof saloonServices.$inferInsert;
export type Service = typeof saloonServices.$inferSelect;