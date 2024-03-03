
import { PgTable, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const saloonServices = pgTable("saloonServices", {
    id: uuid("id").primaryKey().notNull(),
    nome: text("nome").notNull(),
    prezzo: numeric("prezzo").notNull(),
    descrizione : text("descrizione")
});