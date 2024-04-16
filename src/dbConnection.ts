
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg"
import { config } from "dotenv"
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PW,
    port: Number.parseFloat(process.env.DB_PORT!)
});

export const db = drizzle(pool);