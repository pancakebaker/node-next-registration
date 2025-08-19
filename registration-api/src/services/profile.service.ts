// registration-api/src/services/profile.service.ts
import { db } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Public profile shape returned by profile services.
 */
export type Me = {
  id?: string | null;
  /** First/given name */
  name: string;
  /** Optional middle name (may be `null`) */
  middleName?: string | null;
  /** Last/family name */
  familyName: string;
  /** Email address */
  email: string;
  /** Mobile phone number */
  mobile: string;
  /** Unique username */
  username: string;
};

/**
 * Fetch the current user's profile.
 *
 * @param userId - The user's UUID
 * @returns Resolves with the user's profile, or `null` if not found
 *
 * @example
 * ```ts
 * const profile = await getMeService(req.userId!);
 * if (!profile) reply.code(404).send();
 * ```
 */
export async function getMeService(userId: string): Promise<Me | null> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      middleName: users.middleName,
      familyName: users.familyName,
      email: users.email,
      mobile: users.mobile,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Update personal details (name, middle name, family name, email, mobile).
 *
 * @param userId - The user's UUID
 * @param input - Fields to update
 * @param input.name - First/given name
 * @param input.middleName - Optional middle name; empty/undefined is saved as empty string
 * @param input.familyName - Last/family name
 * @param input.email - Email address
 * @param input.mobile - Mobile phone number
 * @returns Promise that resolves when the update completes
 *
 * @remarks
 * - Updates `updatedAt` to the current time.
 * - `middleName` is persisted as an empty string when omitted; adjust if you prefer `null`.
 */
export async function updatePersonalService(
  userId: string,
  input: { name: string; middleName?: string; familyName: string; email: string; mobile: string }
): Promise<void> {
  await db
    .update(users)
    .set({
      name: input.name,
      middleName: input.middleName ?? '',
      familyName: input.familyName,
      email: input.email,
      mobile: input.mobile,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Update account credentials (username and/or password).
 *
 * @param userId - The user's UUID
 * @param input - Partial account fields to update
 * @param input.username - New username (optional)
 * @param input.password - New plaintext password (optional); will be hashed with bcrypt
 * @returns Promise that resolves when all applicable updates complete
 *
 * @remarks
 * - Only updates the fields provided.
 * - Passwords are hashed with bcrypt cost 10 before saving.
 * - Updates `updatedAt` for any changed field.
 *
 * @example
 * ```ts
 * await updateAccountService(userId, { username: "newname" });
 * await updateAccountService(userId, { password: "newStrongP@ss" });
 * ```
 */
export async function updateAccountService(
  userId: string,
  input: { username?: string | ''; password?: string | '' }
): Promise<void> {
  if (input.username) {
    await db
      .update(users)
      .set({ username: input.username, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
  if (input.password) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    await db
      .update(users)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

export async function registerUserService(
  input: { name: string; middleName?: string | null; familyName: string; email: string; mobile: string; username: string; password: string }
): Promise<{
      id: string,
      name: string,
      email: string,
      username: string,
      createdAt: Date,
    } | undefined> {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const inserted = await db
    .insert(users)
    .values({
      name: input.name,
      middleName: input.middleName ?? null,
      familyName: input.familyName,
      email: input.email,
      mobile: input.mobile,
      username: input.username,
      password: passwordHash,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      createdAt: users.createdAt,
    });

  return inserted[0] ?? undefined;
}