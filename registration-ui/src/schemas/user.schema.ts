// registration-ui/src/schemas/user.schema.ts
import { z } from 'zod';

export const personalInfoSchema = z.object({
  id: z.string().optional(),
  username: z.string().optional(),
  name: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().or(z.literal('')),
  familyName: z.string().min(1, 'Family name is required'),
  email: z.email('Please enter a valid email address'),
  mobile: z.string().min(7, 'Mobile number seems too short'),
});

export const accountInfoSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    { message: 'Passwords do not match', path: ['confirmPassword'] }
  );

export const profileAccountSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Only enforce match if user provided a password
      if (!data.password) return true;
      return (data.confirmPassword ?? '') === data.password;
    },
    { message: 'Passwords do not match', path: ['confirmPassword'] }
  );

export const userSchema = personalInfoSchema.merge(accountInfoSchema);

export type UserDetails = z.infer<typeof userSchema>;
export type UserPersonalInfo = z.infer<typeof personalInfoSchema>;
export type UserAccountInfo = z.infer<typeof accountInfoSchema>;
export type ProfileAccountInfo = z.infer<typeof profileAccountSchema>;

export const STEPS = ['Personal Info', 'Account Info'] as const;
export type StepIndex = 0 | 1;
