import type { FastifyInstance } from 'fastify';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas.js';
import { login, rotateRefreshToken, getUserProfile, register } from './auth.service.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Invalid request body', errors: parsed.error.flatten() });
    }

    const tokenSet = await login(app, parsed.data.email, parsed.data.password);
    if (!tokenSet) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    // Return full profile alongside tokens
    const profile = await getUserProfile(tokenSet.user.userId);

    return reply.code(200).send({
      ...tokenSet,
      user: profile || tokenSet.user,
    });
  });

  app.post('/auth/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Invalid request body', errors: parsed.error.flatten() });
    }

    try {
      const tokenSet = await register(app, parsed.data);
      const profile = await getUserProfile(tokenSet.user.userId);
      return reply.code(201).send({
        ...tokenSet,
        user: profile || tokenSet.user,
      });
    } catch (e: any) {
      if (e.message === 'EMAIL_EXISTS') {
        return reply.code(409).send({ message: 'This email is already registered.' });
      }
      throw e;
    }
  });

  app.post('/auth/refresh', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Invalid request body', errors: parsed.error.flatten() });
    }

    const tokenSet = await rotateRefreshToken(app, parsed.data.refreshToken);
    if (!tokenSet) {
      return reply.code(401).send({ message: 'Refresh token is invalid or expired' });
    }

    return reply.code(200).send(tokenSet);
  });

  app.get('/auth/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const profile = await getUserProfile(request.user.userId);
    if (!profile) {
      return reply.code(404).send({ message: 'User not found' });
    }
    return reply.code(200).send({ user: profile });
  });
}
