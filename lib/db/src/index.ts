import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database? Expected format: mysql://USER:PASS@HOST:PORT/DBNAME",
  );
}

// Parse the connection URL — support mysql:// and mysql2://
export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 20,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "utf8mb4_unicode_ci",
  timezone: "Z",
});

export const db = drizzle(pool, { schema, mode: "default" });

export * from "./schema";
