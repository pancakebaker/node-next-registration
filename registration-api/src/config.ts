// src/config.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),

  // JWT / cookies
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be set'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be set'),
  JWT_ACCESS_TTL: z.string().default('10m'),    // 10 minutes
  JWT_REFRESH_TTL: z.string().default('7d'),    // 7 days

  COOKIE_DOMAIN: z.string().optional(),         // e.g. .example.com
});

export const CONFIG = envSchema.parse(process.env);

export const isProd = CONFIG.NODE_ENV === 'production';
