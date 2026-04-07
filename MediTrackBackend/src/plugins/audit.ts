import type { FastifyInstance } from 'fastify';
import { supabase } from '../config/supabase.js';

export async function registerAudit(app: FastifyInstance) {
  app.addHook('onResponse', async (request, reply) => {
    if (request.url.startsWith('/health')) {
      return;
    }

    const userId = request.user?.userId;
    const action = `${request.method} ${request.url}`;
    
    // Asynchronously save to database so we don't block the response
    supabase.from('audit_logs').insert({
      user_id: (request as any).user?.userId || null,
      action,
      resource: request.url,
      metadata: {
        statusCode: reply.statusCode,
        ip: request.ip,
        userAgent: request.headers['user-agent']
      },
      ip_address: request.ip
    }).then(({ error }) => {
      if (error) {
        request.log.error({ err: error }, 'Failed to write audit log to Supabase');
      }
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