import { integer } from "drizzle-orm/pg-core";
import { numeric, pgTable, text } from "drizzle-orm/pg-core";
export const saloonServices = pgTable("saloonServices", {
    id: integer("id").primaryKey(),
    nome: text("nome").notNull(),
    prezzo: numeric("prezzo").notNull(),
    descrizione: text("descrizione")
});
