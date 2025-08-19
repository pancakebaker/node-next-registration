// registration-api/src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie, { type FastifyCookieOptions } from '@fastify/cookie';
import rateLimit, { type RateLimitPluginOptions } from '@fastify/rate-limit';

import { healthCheckDb } from '@/db/client';
import { authRoutes } from '@/routes/auth.route';
import { userRoutes } from './routes/user.routes';

const app = Fastify({ logger: true });

// --- Cookies (unsigned) ---
const cookieOpts: FastifyCookieOptions = {};
if (process.env.COOKIE_SIGNING_SECRET) {
  cookieOpts.secret = process.env.COOKIE_SIGNING_SECRET;
}
await app.register(cookie, cookieOpts);

// --- Security headers ---
await app.register(helmet, {
  contentSecurityPolicy: false, // keep false unless you configure CSP
});

// --- CORS ---
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map(s => s.trim());

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // <-- add this
  maxAge: 86400, // cache preflight in browser (optional, nice for dev)
});

// --- Global rate limit ---
const rlOpts: RateLimitPluginOptions = {
  max: 200,                 // broader global bucket
  timeWindow: '1 minute',
  hook: 'onRequest',
  keyGenerator: (req) => req.ip,
  skipOnError: true,        // don’t DOS your own API if store fails
};
await app.register(rateLimit, rlOpts);

// --- Health ---
app.get('/health', async () => {
  const dbOk = await healthCheckDb();
  return { ok: true, db: dbOk };
});

// --- Routes ---
// You can add a stricter per-route limiter INSIDE the route definition.
// Example (inside your authRoutes file):
// app.post('/api/auth/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, handler);

await app.register(authRoutes);
await app.register(userRoutes);

// --- Graceful shutdown ---
const close = async () => {
  try {
    app.log.info('Shutting down...');
    await app.close();
    (await import('@/db/client')).pool.end().catch(() => { });
  } finally {
    process.exit(0);
  }
};
process.on('SIGINT', close);
process.on('SIGTERM', close);

// --- Start ---
const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`API listening on http://${HOST}:${PORT}`);
} catch (err) {
  app.log.error({ err }, 'Failed to start server');
  process.exit(1);
}
