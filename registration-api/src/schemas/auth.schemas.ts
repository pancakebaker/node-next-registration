// registration-api/features/auth/auth.schemas.ts
import { z } from 'zod';
import { SCHEMA_RULES } from '@/utils/schema_rules';
import {
  strictObject,
  trim,
  lowerTrim,
  EmailString,
  UsernameString,
} from '@/lib/zod-helpers';

/**
 * Zod schema for the login request body.
 * `identifier` can be email or username.
 */
export const loginBodySchema = strictObject({
  identifier: z.preprocess(trim, z.string().min(SCHEMA_RULES.USER.IDENTIFIER.MIN, SCHEMA_RULES.USER.IDENTIFIER.MIN_ERR)).refine(
    (val) =>
      EmailString.safeParse(lowerTrim(val)).success ||
      UsernameString.safeParse(trim(val)).success,
    { message: SCHEMA_RULES.USER.IDENTIFIER.INVALID }
  ),
  password: z
    .preprocess(trim, z.string().min(SCHEMA_RULES.USER.USERNAME.MIN, SCHEMA_RULES.USER.PASSWORD.MIN_ERR)),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

