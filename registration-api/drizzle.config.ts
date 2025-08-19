/// <reference types="node" />
import 'dotenv/config';
import type { Config } from 'drizzle-kit';

function req(name: string, v: string | undefined) {
  if (!v || !v.trim()) throw new Error(`Missing required env ${name}`);
  return v;
}

function buildPgUrlFromParts() {
  const host = process.env.PGHOST ?? 'localhost';
  const port = process.env.PGPORT ?? '5432';
  const db   = req('PGDATABASE', process.env.PGDATABASE);
  const user = req('PGUSER', process.env.PGUSER);
  const pass = req('PGPASSWORD', process.env.PGPASSWORD);

  // Encode just in case your password has special chars
  const enc = encodeURIComponent;
  return `postgres://${enc(user)}:${enc(pass)}@${host}:${port}/${enc(db)}`;
}

const url = process.env.DATABASE_URL ?? buildPgUrlFromParts();

// Optional: add sslmode if you use managed Postgres (render/railway/heroku/etc)
// const url = (process.env.DATABASE_URL ?? buildPgUrlFromParts()) + '?sslmode=prefer';

export default {
  dialect: 'postgresql',
  schema: './src/db/schema/**/*.ts',
  out: './drizzle',
  dbCredentials: { url },
} satisfies Config;
