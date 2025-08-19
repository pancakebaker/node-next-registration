// registration-api/src/db/client.ts
import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/db/schema/users'; // if alias not set, use ../db/schema/users

/**
 * PostgreSQL connection pool.
 *
 * Uses environment variables for configuration:
 * - `PGHOST` (default: localhost)
 * - `PGPORT` (default: 5432)
 * - `PGDATABASE` (default: registration_db)
 * - `PGUSER` (default: postgres)
 * - `PGPASSWORD` (default: empty string)
 */
export const pool = new Pool({
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? 'registration_db',
  user: process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD ?? '',
});

/**
 * Drizzle ORM database instance.
 *
 * Wraps the PostgreSQL connection pool with Drizzle ORM,
 * using the defined schema for type-safe queries.
 */
export const db = drizzle(pool, { schema });

/**
 * Performs a simple health check query against the database.
 *
 * Executes `SELECT 1 as ok` and returns `true` if successful.
 *
 * @async
 * @returns {Promise<boolean>} Resolves with `true` if the database is reachable,
 *   otherwise `false`.
 *
 * @example
 * ```ts
 * const healthy = await healthCheckDb();
 * if (healthy) {
 *   console.log("Database connection OK");
 * }
 * ```
 */
export async function healthCheckDb(): Promise<boolean> {
  const res = await pool.query('select 1 as ok');
  return res.rows[0]?.ok === 1;
}
