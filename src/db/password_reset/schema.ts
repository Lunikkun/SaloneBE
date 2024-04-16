
import { timestamp } from "drizzle-orm/pg-core";
import { integer, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const password_reset = pgTable("password_reset", {
    user_id : integer("user_id").notNull(),
    token : text("token").notNull().unique(),
    expires_at : timestamp("expires_at", {withTimezone : false})
})

export type PasswordReset = typeof password_reset.$inferSelect
export type InsertPasswordReset = typeof password_reset.$inferInsert
