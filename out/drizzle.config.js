import 'dotenv/config';
export default {
    schema: ["./src/db/**/schema.ts"],
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        user: "postgres",
        host: "localhost",
        database: "postgres",
        password: "admin",
        port: 5432
    },
    verbose: true,
    strict: true
};
