import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set (e.g. mysql://user:pass@host:3306/dbname)");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  mode: "default",
  verbose: true,
  strict: true,
});
