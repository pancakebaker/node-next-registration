// src/lib/jwt.ts
import jwt from 'jsonwebtoken';
import ms, { type StringValue } from 'ms';

/**
 * Shape of JWT payloads.
 * 
 * - Extends a generic object (`Record<string, unknown>`)
 * - Includes optional `sub` (subject, typically user ID)
 */
type JwtPayload = Record<string, unknown> & { sub?: string };

/**
 * Signs a JSON Web Token (JWT) with the given payload, secret, and TTL.
 *
 * @param payload - The JWT payload (custom claims). Should be serializable.
 * @param secret - The secret key used to sign the token (HS256).
 * @param ttl - Time-to-live for the token (e.g., `'15m'`, `'7d'`).
 *
 * @returns A Promise that resolves with the signed JWT string.
 *
 * @example
 * ```ts
 * const token = await signJwt({ sub: "user123" }, process.env.JWT_SECRET!, "15m");
 * console.log(token); // eyJhbGciOiJIUzI1...
 * ```
 */
export function signJwt(
  payload: JwtPayload,
  secret: string,
  ttl: StringValue // e.g. '15m', '7d'
): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      secret,
      {
        algorithm: 'HS256',
        expiresIn: Math.floor(ms(ttl) / 1000), // seconds
      },
      (err, token) => (err || !token ? reject(err) : resolve(token))
    );
  });
}

/**
 * Verifies a JSON Web Token (JWT) and returns its decoded payload.
 *
 * @typeParam T - Optional type extending `JwtPayload` to strongly type the returned payload.
 *
 * @param token - The JWT string to verify.
 * @param secret - The secret key used to sign the token.
 *
 * @returns The decoded JWT payload, cast to type `T`.
 *
 * @throws Will throw if the token is invalid, expired, or signature verification fails.
 *
 * @example
 * ```ts
 * interface MyClaims extends JwtPayload {
 *   sub: string;
 *   role: string;
 * }
 * 
 * const decoded = verifyJwt<MyClaims>(token, process.env.JWT_SECRET!);
 * console.log(decoded.sub, decoded.role);
 * ```
 */
export function verifyJwt<T extends JwtPayload = JwtPayload>(
  token: string,
  secret: string
): T {
  return jwt.verify(token, secret, { algorithms: ['HS256'] }) as T;
}
