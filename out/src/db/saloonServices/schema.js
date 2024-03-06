import { numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
export const saloonServices = pgTable("saloonServices", {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    nome: text("nome").notNull(),
    prezzo: numeric("prezzo").notNull(),
    descrizione: text("descrizione")
});
