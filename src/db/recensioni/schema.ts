import { users } from './../users/schema';
import { text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from "drizzle-orm/pg-core";
import { serial } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const recensioni = pgTable("recensioni", {
    id: serial("id").primaryKey(),
    id_utente : integer("id_utente").notNull().references(()=>{return users.id}),
    voto: integer("voto").default(3).notNull(),
    recensione : text("recensione"),
    data_recensione : timestamp("data_recensione").default(new Date(Date.now()))
});

export type Recensione = typeof recensioni.$inferSelect;
export type InsertRecensione = typeof recensioni.$inferInsert;