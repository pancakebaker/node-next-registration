// src/lib/cookies.ts
import type { FastifyReply } from 'fastify';
import { CONFIG, isProd } from '@/config';

/**
 * Common cookie options used for authentication cookies.
 *
 * - `httpOnly`: prevents JavaScript access
 * - `secure`: only sent over HTTPS (true in production)
 * - `sameSite`: lax mode (helps mitigate CSRF)
 * - `path`: root path
 */
const common = {
  httpOnly: true,
  secure: isProd,         // true in prod (HTTPS)
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Sets authentication cookies (`access_token` and `refresh_token`) in the HTTP response.
 *
 * @param reply - Fastify reply object used to set cookies
 * @param access - Access token (short-lived, ~10 minutes)
 * @param refresh - Refresh token (long-lived, ~7 days)
 *
 * @remarks
 * - `access_token` expires in **10 minutes** (`maxAge: 600s`).
 * - `refresh_token` expires in **7 days** (`maxAge: 604800s`).
 * - If `CONFIG.COOKIE_DOMAIN` is set, cookies will be scoped to that domain.
 *
 * @example
 * ```ts
 * setAuthCookies(reply, accessToken, refreshToken);
 * ```
 */
export function setAuthCookies(reply: FastifyReply, access: string, refresh: string) {
  const domainOpt = CONFIG.COOKIE_DOMAIN ? { domain: CONFIG.COOKIE_DOMAIN } : {};

  reply
    .setCookie('access_token', access, {
      ...common,
      maxAge: 60 * 10, // 10m (seconds)
      ...domainOpt,
    })
    .setCookie('refresh_token', refresh, {
      ...common,
      maxAge: 60 * 60 * 24 * 7, // 7d (seconds)
      ...domainOpt,
    });
}

/**
 * Clears authentication cookies (`access_token` and `refresh_token`) from the HTTP response.
 *
 * @param reply - Fastify reply object used to clear cookies
 *
 * @remarks
 * - Clears both tokens by setting expired cookies.
 * - If `CONFIG.COOKIE_DOMAIN` is set, will also clear cookies for that domain.
 *
 * @example
 * ```ts
 * clearAuthCookies(reply);
 * ```
 */
export function clearAuthCookies(reply: FastifyReply) {
  const domainOpt = CONFIG.COOKIE_DOMAIN ? { domain: CONFIG.COOKIE_DOMAIN } : {};
  reply
    .clearCookie('access_token', { path: '/', ...domainOpt })
    .clearCookie('refresh_token', { path: '/', ...domainOpt });
}
