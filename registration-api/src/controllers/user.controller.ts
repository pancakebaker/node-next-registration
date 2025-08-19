// src/controllers/user.controller.ts
import type { FastifyReply, FastifyRequest } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema/users';
import { getMeService, registerUserService, updateAccountService, updatePersonalService } from '@/services/profile.service';
import { registerBodySchema, type RegisterBody } from '@/schemas/register.schemas';
import { accountUpdateSchema, personalUpdateSchema } from '@/schemas/profile.schema';
import { RESPONSE_TEXTS } from '@/utils/response_texts';

/**
 * Controller handling user-related operations such as registration,
 * profile retrieval, and account updates.
 */
export class UserController {
  /**
   * Register a new user
   * 
   * **Endpoint:** `POST /api/auth/register`
   * 
   * Steps:
   * - Validates that email and username are unique
   * - Hashes the password
   * - Inserts the new user into the database
   * 
   * @param req - Fastify request containing `RegisterBody` in `req.body`
   * @param reply - Fastify reply object for sending the response
   * @returns 201 with created user data, or 409 if email/username already exists
   */
  async register(req: FastifyRequest, reply: FastifyReply) {
    // const body = req.body;
    const raw = (req.body ?? {}) as unknown;
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const result = registerBodySchema.safeParse(body);
    
    if (!result.success) {
      const { fieldErrors, formErrors } = result.error.flatten();
      return reply.code(400).send({
        success: false,
        message: 'Validation failed',
        errors: { fieldErrors, formErrors },
      });
    }

    const parsed: RegisterBody = result.data;

    // uniqueness checks
    const [emailExisting] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.email))
      .limit(1);

    if (emailExisting) {
      return reply.code(409).send({ success: false, message: RESPONSE_TEXTS.USER.EMAIL_EXISTS });
    }

    const [usernameExisting] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, body.username))
      .limit(1);

    if (usernameExisting) {
      return reply.code(409).send({ success: false, message: RESPONSE_TEXTS.USER.USERNAME_EXISTS });
    }

    const inserted = await registerUserService({
      name: body.name,
      middleName: body.middleName ?? null,
      familyName: body.familyName,
      email: body.email,
      mobile: body.mobile,
      username: body.username,
      password: body.password
    });

    return reply.code(201).send({ success: true, data: inserted });
  }

  /**
   * Get profile of the currently authenticated user
   * 
   * **Endpoint:** `GET /api/profile/me`
   * 
   * @param req - Fastify request (requires `req.userId`)
   * @param reply - Fastify reply object
   * @returns 200 with user profile, 401 if unauthorized, 404 if not found
   */
  async getMe(req: FastifyRequest, reply: FastifyReply) {
    if (!req.userId) return reply.status(401).send({ message: RESPONSE_TEXTS.USER.UNAUTHORIZED });
    const me = await getMeService(req.userId);
    if (!me) return reply.status(404).send({ message: RESPONSE_TEXTS.USER.USER_NOT_FOUND });
    return reply.send(me);
  }

  /**
   * Update personal information of the currently authenticated user
   * 
   * **Endpoint:** `PUT /api/profile/personal`
   * 
   * Validates request body against `personalUpdateSchema`.
   * 
   * @param req - Fastify request containing personal update fields
   * @param reply - Fastify reply object
   * @returns 204 on success, 400 if invalid input, 401 if unauthorized
   */
  async updatePersonal(req: FastifyRequest, reply: FastifyReply) {
    if (!req.userId) return reply.status(401).send({ message: RESPONSE_TEXTS.USER.UNAUTHORIZED });

    const raw = (req.body ?? {}) as unknown;
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const parsed = personalUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return reply.status(400).send({ message: parsed.error.issues[0]?.message ?? RESPONSE_TEXTS.USER.INVALID_INPUT });
    }

    const data = parsed.data;
    await updatePersonalService(req.userId, {
      name: data.name,
      familyName: data.familyName,
      email: data.email,
      middleName: data.middleName ?? '',
      mobile: data.mobile,
    });

    return reply.status(204).send();
  }

  /**
   * Update account information (username and/or password) of the currently authenticated user
   * 
   * **Endpoint:** `PUT /api/profile/account`
   * 
   * Validates request body against `accountUpdateSchema`.
   * 
   * @param req - Fastify request containing account update fields
   * @param reply - Fastify reply object
   * @returns 204 on success, 400 if invalid input, 401 if unauthorized
   */
  async updateAccount(req: FastifyRequest, reply: FastifyReply) {
    if (!req.userId) return reply.status(401).send({ message: RESPONSE_TEXTS.USER.UNAUTHORIZED });

    const raw = (req.body ?? {}) as unknown;
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const parsed = accountUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return reply.status(400).send({ message: 'hey' + (parsed.error.issues[0]?.message ?? ' ' + RESPONSE_TEXTS.USER.INVALID_INPUT) });
    }

    const data = parsed.data;

    await updateAccountService(req.userId, {
      username: data.username ?? '',
      password: data.password ?? '',
    });

    return reply.status(204).send();
  }
}

/** Exported singleton instance of UserController */
export const userController = new UserController();
