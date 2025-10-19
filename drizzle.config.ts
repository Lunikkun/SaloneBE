import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: ["./src/db/**/schema.ts"],
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PW,
    port: Number.parseFloat(process.env.DB_PORT!),
    ssl: false
  },
  verbose: true,
  strict: true,
} as Config
