// registration-api/src/db/schema/users.ts
import { pgTable, uuid, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Users table schema definition.
 *
 * Represents registered users in the application.
 * 
 * Columns:
 * - `id` (UUID, PK) – unique identifier generated with `gen_random_uuid()`
 * - `name` (string, required, max 100) – first or given name
 * - `middleName` (string, optional, max 100) – optional middle name
 * - `familyName` (string, required, max 100) – last/family name
 * - `email` (string, required, max 255) – must be unique
 * - `mobile` (string, required, max 20) – phone number
 * - `username` (string, required, max 50) – must be unique
 * - `password` (string, required, max 255) – hashed password
 * - `createdAt` (timestamp, required) – record creation timestamp (defaults to `now()`)
 * - `updatedAt` (timestamp, required) – record update timestamp (defaults to `now()`)
 *
 * Indexes:
 * - `users_email_unique` – ensures email uniqueness
 * - `users_username_unique` – ensures username uniqueness
 *
 * @example
 * ```ts
 * import { db } from "@/db/client";
 * import { users } from "@/db/schema/users";
 * 
 * // Insert a new user
 * await db.insert(users).values({
 *   name: "John",
 *   familyName: "Doe",
 *   email: "john@example.com",
 *   mobile: "+1234567890",
 *   username: "johndoe",
 *   password: "hashedpassword123"
 * });
 * ```
 */
export const users = pgTable(
  'users',
  {
    /** Unique identifier for the user */
    id: uuid('id').defaultRandom().primaryKey(),

    /** First or given name */
    name: varchar('name', { length: 100 }).notNull(),

    /** Optional middle name */
    middleName: varchar('middle_name', { length: 100 }),

    /** Last or family name */
    familyName: varchar('family_name', { length: 100 }).notNull(),

    /** Email address (must be unique) */
    email: varchar('email', { length: 255 }).notNull(),

    /** Mobile phone number */
    mobile: varchar('mobile', { length: 20 }).notNull(),

    /** Username (must be unique) */
    username: varchar('username', { length: 50 }).notNull(),

    /** Hashed password */
    password: varchar('password', { length: 255 }).notNull(),

    /** Record creation timestamp */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /** Record last update timestamp */
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    /** Unique index on email */
    emailUnique: uniqueIndex('users_email_unique').on(table.email),

    /** Unique index on username */
    usernameUnique: uniqueIndex('users_username_unique').on(table.username),
  })
);
