import { timestamp } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { pgTable, serial } from "drizzle-orm/pg-core";
import { saloonServices } from "../saloonServices/schema";
import { users } from "../users/schema";

export const prenotazioni = pgTable("prenotazioni", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  service_id: integer("service_id")
    .notNull()
    .references(() => saloonServices.id),
  data_prenotazione: timestamp("data_pren", { withTimezone: false }).notNull(),
});

export type Prenotazione = typeof prenotazioni.$inferSelect;
export type InsertPrenotazione = typeof prenotazioni.$inferInsert;
