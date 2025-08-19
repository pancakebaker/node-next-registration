// src/schemas/auth/login.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Username or email is required')
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^[a-zA-Z0-9_.-]+$/.test(val),
      { message: 'Must be a valid email or username' }
    ),
  password: z.string(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
