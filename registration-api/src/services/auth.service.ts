// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import { db } from '@/db/client';                 // your Drizzle client
import { users } from '@/db/schema/users';       // your Drizzle table
import { eq, or } from 'drizzle-orm';
import { CONFIG } from '@/config';
import { signJwt } from '@/lib/jwt';
import type { StringValue } from 'ms';

/**
 * Publicly exposable user shape returned by authentication.
 */
export type PublicUser = {
  /** User ID (UUID) */
  id: string;
  /** Display / full name */
  name: string;
  /** Unique username */
  username: string;
  /** Email (as stored; typically lowercased) */
  email: string;
};

/**
 * Internal DB user shape (includes hashed password).
 */
type DbUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  /** Stored bcrypt hash */
  password: string;
};

/**
 * Precomputed dummy hash to mitigate user enumeration & timing attacks
 * when a user record is not found. This ensures bcrypt.compare is
 * always executed with similar cost.
 *
 * (bcryptjs hash for string 'invalid-password' with cost 10)
 */
const DUMMY_HASH =
  '$2a$10$JtqYvZbqvB4QzqK4gl0m9e8cZ7pK9D5T1f2o7Q8c5rV5SgU8V5hA2';

/**
 * Authenticates a user by username or email and returns JWT tokens.
 *
 * Steps:
 * 1. Detect whether `identifier` looks like an email; normalize to lowercase if so.
 * 2. Query user by username OR email (email lookup uses normalized value).
 * 3. Always run `bcrypt.compare` (with a dummy hash if user not found) to reduce timing leaks.
 * 4. On success, return a `PublicUser` plus signed access & refresh tokens.
 *
 * @param identifier - Username **or** email address (email is normalized to lowercase)
 * @param password - Plaintext password to verify against the stored bcrypt hash
 *
 * @returns Promise resolving to:
 * - `{ user: PublicUser, accessToken, refreshToken }` on success
 * - `{ user: null }` on failure (invalid credentials)
 *
 * @throws May throw if JWT signing fails due to misconfiguration
 * (e.g., missing `CONFIG.JWT_*_SECRET` or invalid TTL).
 *
 * @example
 * ```ts
 * const result = await authenticate("jdoe", "secret123");
 * if (!result.user) {
 *   // invalid credentials
 * } else {
 *   // use result.accessToken, result.refreshToken
 * }
 * ```
 */
export async function authenticate(
  identifier: string,
  password: string
): Promise<{
  user: PublicUser | null;
  accessToken?: string;
  refreshToken?: string;
}> {
  const isEmail = identifier.includes('@');
  const emailNorm = isEmail ? identifier.toLowerCase() : null;

  // Find by username OR email (emails normalized to lowercase)
  const row = (await db.query.users.findFirst({
    where: or(
      eq(users.username, identifier),
      isEmail ? eq(users.email, emailNorm!) : eq(users.username, '__nope__') // cheap guard
    ),
    columns: {
      id: true,
      name: true,
      username: true,
      email: true,
      password: true,
    },
  })) as DbUser | undefined;

  // Timing-safe: always do a bcrypt compare
  const hashToCheck = row?.password ?? DUMMY_HASH;
  const ok = await bcrypt.compare(password, hashToCheck);

  if (!row || !ok) {
    return { user: null };
  }

  const publicUser: PublicUser = {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
  };

  // JWTs
  const accessToken = await signJwt(
    { sub: row.id, username: row.username },
    CONFIG.JWT_ACCESS_SECRET,
    CONFIG.JWT_ACCESS_TTL as StringValue
  );

  const refreshToken = await signJwt(
    { sub: row.id, type: 'refresh' },
    CONFIG.JWT_REFRESH_SECRET,
    CONFIG.JWT_REFRESH_TTL as StringValue
  );

  return { user: publicUser, accessToken, refreshToken };
}
