
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg"
const { Pool } = pkg;

const pool = new Pool({
    user:"postgres",
    host: "localhost",
    database: "postgres",
    password: "admin",
    port: 5432
});

const db = drizzle(pool);