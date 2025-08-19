// registration-api/features/register/register.schema.ts
import { z } from 'zod';
import {
  strictObject,
  NamePreProcessor,
  FamilyNamePreProcessor,
  MiddleNamePreProcessor,
  EmailPreProcessor,
  MobilePreProcessor,
  UsernamePreProcessor,
  PasswordPreProcessor,
} from '@/lib/zod-helpers';
import { RESPONSE_TEXTS } from '@/utils/response_texts';

/**
 * Zod schema for the user registration request body.
 */
export const registerBodySchema = strictObject({
  name: NamePreProcessor,
  middleName: MiddleNamePreProcessor,
  familyName: FamilyNamePreProcessor,
  email: EmailPreProcessor,
  mobile: MobilePreProcessor,
  username: UsernamePreProcessor,
  password: PasswordPreProcessor,
  confirmPassword: PasswordPreProcessor,
}).superRefine((d, ctx) => {
  if (d.password) {
    if (!d.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Please confirm your password.',
      });
    } else if (d.password !== d.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: RESPONSE_TEXTS.USER.PASSWORDS_NO_MATCH,
      });
    }
  }
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
