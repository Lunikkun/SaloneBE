import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users/schema";

export const sessions = pgTable("sessions", {

    id : serial("id").primaryKey(),
    token : text("token").unique(),
    user_id : integer("user_id").references(()=>users.id),
    created_at : timestamp("created_at", {withTimezone : false}).defaultNow(),
    expires_at : timestamp("expires_at", {withTimezone : false})

})

export type InsertSession = typeof sessions.$inferInsert;
export type Session = typeof sessions.$inferSelect;