import { integer } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { pgTable, serial, text, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  mail: text("mail").notNull().unique(),
  nome: text("nome").notNull(),
  cognome: text("cognome").notNull(),
  password: text("password").notNull(),
  gender: text("gender").notNull().default("Female"),
  creation_date : timestamp("data_creazione").defaultNow(),
  isAdmin : boolean("isAdmin").default(false)
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
