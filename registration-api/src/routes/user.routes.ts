// src/routes/user.routes.ts
import type { FastifyInstance } from 'fastify';
import { authGuard } from '@/middleware/auth';
import { userController } from '@/controllers/user.controller';

/**
 * Registers user-related routes.
 *
 * Routes include:
 *
 * ### Public
 * - **POST** `/api/auth/register`  
 *   Registers a new user.
 *
 * ### Protected (requires `authGuard`)
 * - **GET** `/api/profile/me`  
 *   Retrieves the authenticated user's profile.
 *
 * - **PUT** `/api/profile/personal`  
 *   Updates the authenticated user's personal information (name, email, mobile, etc.).
 *
 * - **PUT** `/api/profile/account`  
 *   Updates the authenticated user's account information (username, password).
 *
 * @param app - Fastify instance
 *
 * @example
 * ```ts
 * import fastify from "fastify";
 * import { userRoutes } from "./routes/user.routes";
 *
 * const app = fastify();
 * await app.register(userRoutes);
 * app.listen({ port: 4000 });
 * ```
 */
export async function userRoutes(app: FastifyInstance) {
  // Public register route
  app.post('/api/auth/register', async (req, reply) => userController.register(req as any, reply));

  // Protected routes
  app.register(async function (privateScope) {
    // Apply auth guard to all routes in this scope
    privateScope.addHook('preHandler', authGuard);

    privateScope.get('/api/profile/me', (req, reply) => userController.getMe(req, reply));
    privateScope.put('/api/profile/personal', (req, reply) => userController.updatePersonal(req, reply));
    privateScope.put('/api/profile/account', (req, reply) => userController.updateAccount(req, reply));
  });
}
