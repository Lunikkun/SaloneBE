import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "admin",
    port: 55000
});
export const db = drizzle(pool);
