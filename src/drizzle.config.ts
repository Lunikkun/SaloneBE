import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: ["./**/*.ts"],
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    user:"postgres",
    host: "localhost",
    database: "postgres",
    password: "admin",
    port: 5432
  },
  verbose: true,
  strict: true
} satisfies Config;