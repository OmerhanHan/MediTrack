import type { FastifyInstance } from 'fastify';
import { prisma } from './prisma.js';

export async function registerAudit(app: FastifyInstance) {
  app.addHook('onResponse', async (request, reply) => {
    if (request.url.startsWith('/health')) {
      return;
    }

    const userId = request.user?.userId;
    const action = `${request.method} ${request.url}`;
    
    // Asynchronously save to database so we don't block the response
    prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        resource: request.url,
        metadata: JSON.stringify({
          statusCode: reply.statusCode,
          ip: request.ip,
          userAgent: request.headers['user-agent']
        }),
        ipAddress: request.ip
      }
    }).catch((err) => {
      request.log.error({ err }, 'Failed to write audit log to database');
    });

    request.log.info(
      {
        event: 'audit.request.completed',
        method: request.method,
        path: request.url,
        statusCode: reply.statusCode,
        userId,
      },
      'Request completed',
    );
  });
}