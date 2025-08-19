// src/lib/zod-helpers.ts
import { SCHEMA_RULES } from '@/utils/schema_rules';
import { z } from 'zod';

/**
 * Trim strings; pass-through for non-strings.
 */
export const trim = (v: unknown) => (typeof v === 'string' ? v.trim() : v);

/**
 * Convert empty string to `null`; pass-through otherwise.
 */
export const emptyToNull = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? null : v;

/**
 * Convert empty string to `undefined`; pass-through otherwise.
 */
export const emptyToUndef = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

/**
 * Lowercase + trim (for emails).
 */
export const lowerTrim = (v: unknown) => {
  const t = trim(v);
  return typeof t === 'string' ? t.toLowerCase() : t;
};

/**
 * Create a strict Zod object (reject unknown keys).
 */
export const strictObject = <T extends z.ZodRawShape>(shape: T) =>
  z.object(shape).strict();

/** Common patterns */
export const usernamePattern = /^[a-zA-Z0-9_.-]+$/;
// E.164-ish international mobile (7–15 digits, optional +, first digit non-zero)
export const mobilePattern = /^\+?[1-9]\d{7,14}$/;

/** Reusable field schemas (compose with preprocess when needed) */
export const EmailString = z.email();
export const UsernameString = z
  .string()
  .regex(usernamePattern, 'Username can only contain letters, numbers, underscores, dots, and hyphens');
export const MobileString = z
  .string()
  .regex(mobilePattern, 'Enter a valid mobile number in international format (e.g. +639XXXXXXXXX)');

/**
 * Factory: trimmed string with min/max bounds.
 * @param rules Object shaped like { MIN, MIN_ERR, MAX, MAX_ERR }
 */
export const makeTrimmedBounded = (rules: {
  MIN: number;
  MIN_ERR: string;
  MAX: number;
  MAX_ERR: string;
}) =>
  z.preprocess(
    trim,
    z
      .string()
      .min(rules.MIN, rules.MIN_ERR)
      .max(rules.MAX, rules.MAX_ERR)
  );

/**
* Pre-configured name fields using SCHEMA_RULES.
* Drop-in constants so you can write: `name: NamePreProcessor`.
*/
export const NamePreProcessor = makeTrimmedBounded(SCHEMA_RULES.USER.NAME);

export const FamilyNamePreProcessor = makeTrimmedBounded(SCHEMA_RULES.USER.FAMILY_NAME);

export const MiddleNamePreProcessor = z.preprocess(
  emptyToNull,
  z.string()
    .max(SCHEMA_RULES.USER.MIDDLE_NAME.MAX, SCHEMA_RULES.USER.MIDDLE_NAME.MAX_ERR)
    .nullable()
    .optional(),
);

export const EmailPreProcessor = z.preprocess(
  lowerTrim,
  EmailString.max(SCHEMA_RULES.USER.EMAIL.MAX, SCHEMA_RULES.USER.EMAIL.MAX_ERR)
);

export const MobilePreProcessor = z.preprocess(trim, MobileString.max(SCHEMA_RULES.USER.MOBILE.MAX, SCHEMA_RULES.USER.MOBILE.MAX_ERR));

export const UsernamePreProcessor = z.preprocess(
  trim,
  UsernameString
    .min(SCHEMA_RULES.USER.USERNAME.MIN, SCHEMA_RULES.USER.USERNAME.MIN_ERR)
    .max(SCHEMA_RULES.USER.USERNAME.MAX, SCHEMA_RULES.USER.USERNAME.MAX_ERR)
);

export const PasswordPreProcessor = z.preprocess(
  trim,
  z
    .string()
    .min(SCHEMA_RULES.USER.PASSWORD.MIN, SCHEMA_RULES.USER.PASSWORD.MIN_ERR)
    .max(SCHEMA_RULES.USER.PASSWORD.MAX, SCHEMA_RULES.USER.PASSWORD.MAX_ERR)
);