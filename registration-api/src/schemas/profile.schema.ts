// registration-api/src/features/profile/profile.schema.ts
import { z } from 'zod';
import { RESPONSE_TEXTS } from '@/utils/response_texts';
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

/** Personal update */
export const personalUpdateSchema = strictObject({
  name: NamePreProcessor,
  middleName: MiddleNamePreProcessor,
  familyName: FamilyNamePreProcessor,
  email: EmailPreProcessor,
  mobile: MobilePreProcessor,
});
export type PersonalUpdateInput = z.infer<typeof personalUpdateSchema>;

/** Account update */
export const accountUpdateSchema = strictObject({
  username: UsernamePreProcessor,
  password: PasswordPreProcessor.optional(),
  confirmPassword: PasswordPreProcessor.optional(),
}).superRefine((d, ctx) => {
  if (d.password && d.password !== (d.confirmPassword ?? '')) {
    ctx.addIssue({
      code: 'custom',
      message: RESPONSE_TEXTS.USER.PASSWORDS_NO_MATCH,
      path: ['confirmPassword'],
    });
  }
});
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
