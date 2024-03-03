import 'dotenv/config';
export default {
    schema: ["./**/*.ts"],
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    verbose: true,
    strict: true
};
