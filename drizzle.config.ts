import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: ["./src/db/**/schema.ts"],
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PW,
    port: Number.parseFloat(process.env.DB_PORT!)
  },
  verbose: true,
  strict: true
} satisfies Config;