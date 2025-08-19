// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PAGE_LINKS, TOKENS } from './lib/constants';

/**
 * Determines whether a JWT is **missing**, **malformed**, or **expired**.
 *
 * - Safely decodes the payload and checks the `exp` (seconds since epoch).
 * - Returns `true` when the token is absent, cannot be decoded, or has passed its expiry.
 * - Returns `false` when the token is present and either has no `exp` claim or is not yet expired.
 *
 * @param token - The JWT access token string (e.g., from cookies).
 * @returns `true` if the token should be treated as invalid/expired; otherwise `false`.
 */
function isExpiredJwt(token?: string) {
  try {
    if (!token) return true;
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const json = Buffer.from(
      parts[1].replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf8');
    const payload = JSON.parse(json);
    if (typeof payload?.exp !== 'number') return false;
    return payload.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

/**
 * Global middleware for auth-aware routing.
 *
 * Behavior:
 * - **Protected routes** (`/dashboard`, `/profile`): require a valid (non-expired) access token.
 *   - If missing/expired, redirect to `/login?next=<originalPathAndQuery>` and clear stale cookies to prevent loops.
 * - **Auth pages** (`/login`, `/register`):
 *   - If `?next=` is present: allow rendering and clear any existing tokens for a clean login.
 *   - If already authenticated and no `?next=`: redirect to `/dashboard`.
 * - All other requests: pass through.
 *
 * Cookies:
 * - Uses names from {@link TOKENS} to read and clear `access` / `refresh` tokens.
 *
 * @param req - The incoming Next.js {@link NextRequest}.
 * @returns A {@link NextResponse} that either continues, or redirects based on auth state.
 */
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const token = req.cookies.get(TOKENS.ACCESS)?.value;

  const isProtected =
    pathname.startsWith(PAGE_LINKS.DASHBOARD) ||
    pathname.startsWith(PAGE_LINKS.PROFILE);
  const isAuthPage =
    pathname === PAGE_LINKS.LOGIN || pathname === PAGE_LINKS.REGISTER;
  const hasNext = searchParams.has('next');

  const authed = !!token && !isExpiredJwt(token);

  // Protected pages require valid token
  if (isProtected && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = PAGE_LINKS.LOGIN;
    url.searchParams.set('next', pathname + (req.nextUrl.search || ''));
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(TOKENS.ACCESS); // drop stale cookie to avoid loops
    res.cookies.delete(TOKENS.REFRESH);
    return res;
  }

  // If visiting /login or /register:
  // - If there's a next param, allow rendering AND clear any existing tokens so login is clean
  if (isAuthPage && hasNext) {
    const res = NextResponse.next();
    if (token) res.cookies.delete(TOKENS.ACCESS);
    res.cookies.delete(TOKENS.REFRESH);
    return res;
  }

  // - If authed and no next param, push to /dashboard
  if (isAuthPage && authed && !hasNext) {
    const url = req.nextUrl.clone();
    url.pathname = PAGE_LINKS.DASHBOARD;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Middleware route matching configuration.
 *
 * The middleware runs for:
 * - `/dashboard` (and all nested paths)
 * - `/profile`   (and all nested paths)
 * - `/login`
 * - `/register`
 */
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/register'],
};
