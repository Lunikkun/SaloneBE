import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users/schema.js";
export const sessions = pgTable("sessions", {
    id: serial("id"),
    token: text("token").unique(),
    user_id: integer("user_id").references(() => users.id),
    created_at: timestamp("created_at"),
    expires_at: timestamp("expires_at")
});
