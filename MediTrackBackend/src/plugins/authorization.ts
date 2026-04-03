import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { AppRole } from '../common/types.js';

type AuthHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

export async function registerAuthorization(app: FastifyInstance) {
  app.decorate('requireRoles', (...roles: AppRole[]) => {
    const preHandler: AuthHandler = async (request, reply) => {
      if (!request.user || !roles.includes(request.user.role)) {
        reply.code(403).send({ message: 'Forbidden' });
      }
    };

    return preHandler;
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    requireRoles: (...roles: AppRole[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}