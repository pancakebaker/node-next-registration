// src/middleware/auth.ts
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { verifyJwt } from '@/lib/jwt';
import { CONFIG } from '@/config';
import { RESPONSE_TEXTS } from '@/utils/response_texts';

declare module 'fastify' {
  /**
   * Extends FastifyRequest to include the authenticated user's ID.
   */
  interface FastifyRequest {
    /** ID of the authenticated user (from JWT `sub` claim) */
    userId?: string;
  }
}

/**
 * Authentication guard middleware for protecting routes.
 *
 * - Extracts the JWT from the `Authorization` header (`Bearer <token>`).
 * - Verifies the token using the configured `JWT_ACCESS_SECRET`.
 * - If valid, attaches the user ID (`sub`) to `req.userId`.
 * - If invalid or missing, responds with **401 Unauthorized**.
 *
 * @param req - Fastify request object (may be extended with `userId`)
 * @param reply - Fastify reply object for sending HTTP responses
 *
 * @returns A promise that resolves if the user is authenticated, 
 * or sends a `401 Unauthorized` response otherwise.
 *
 * @example
 * ```ts
 * // Usage in a route
 * fastify.get("/api/profile/me", { preHandler: [authGuard] }, async (req, reply) => {
 *   return { userId: req.userId };
 * });
 * ```
 */
export async function authGuard(req: FastifyRequest, reply: FastifyReply) {
  const h = req.headers.authorization ?? '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : undefined;
  if (!token) return reply.code(401).send({ message: RESPONSE_TEXTS.USER.UNAUTHORIZED });

  try {
    const payload = verifyJwt<{ sub?: string }>(token, CONFIG.JWT_ACCESS_SECRET);
    if (!payload.sub) return reply.code(401).send({ message: RESPONSE_TEXTS.USER.UNAUTHORIZED });
    req.userId = payload.sub;
  } catch {
    return reply.code(401).send({ message: RESPONSE_TEXTS.USER.UNAUTHORIZED });
  }
}
