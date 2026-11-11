import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & { databasePool?: Pool };

export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manquante");
  return (globalForDb.databasePool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  }));
}
