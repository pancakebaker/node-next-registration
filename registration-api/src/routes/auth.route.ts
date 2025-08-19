// registration-api/src/features/auth/auth.route.ts
import { authenticate } from '@/services/auth.service';
import { RESPONSE_TEXTS } from '@/utils/response_texts';
import type { FastifyInstance, FastifyRequest, FastifySchema } from 'fastify';

type LoginBody = { identifier: string; password: string };
type LoginReq = FastifyRequest<{ Body: LoginBody }> & { validationError?: unknown };

/** JSON schema for the login route request & response validation. */
const loginSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['identifier', 'password'],
    properties: {
      identifier: { type: 'string', minLength: 1 },
      password:   { type: 'string', minLength: 6 },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      required: ['success', 'data'],
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          required: ['user', 'accessToken', 'refreshToken'],
          properties: {
            user: {
              type: 'object',
              required: ['id', 'name', 'username', 'email'],
              properties: {
                id: { type: 'string' }, name: { type: 'string' },
                username: { type: 'string' }, email: { type: 'string' },
              },
              additionalProperties: false,
            },
            accessToken: { type: 'string' },
            refreshToken:{ type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    401: {
      type: 'object',
      required: ['success', 'error'],
      properties: {
        success: { type: 'boolean' },
        error:   { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    schema: loginSchema,
    attachValidation: true, // ← let handler run even if schema validation fails
    handler: async (req, reply) => {
      const r = req as LoginReq;

      // If schema failed (e.g., empty/short password), return generic message
      if (r.validationError) {
        req.log.warn({ err: r.validationError }, 'Login schema failed');
        return reply.code(401).send({
          success: false,
          error: RESPONSE_TEXTS.USER.INVALID_CREDENTIALS, // e.g. "Login failed"
        });
      }

      const { identifier, password } = r.body;

      const result = await authenticate(identifier, password);

      if (!result.user || !result.accessToken || !result.refreshToken) {
        return reply.code(401).send({
          success: false,
          error: RESPONSE_TEXTS.USER.INVALID_CREDENTIALS,
        });
      }

      return reply.send({ success: true, data: result });
    },
  });
}
