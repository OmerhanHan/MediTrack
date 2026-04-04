import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { AuthUser } from '../common/types.js';
import { supabase } from '../config/supabase.js';

export async function registerAuth(app: FastifyInstance) {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing token');
      }
      
      const token = authHeader.replace('Bearer ', '');
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        throw new Error('Invalid token');
      }

      // First try to fetch user role from our public.users table
      const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      (request as any).user = {
        userId: data.user.id,
        email: data.user.email!,
        role: (dbUser?.role as AuthUser['role']) || 'doctor',
      };
    } catch (err) {
      reply.code(401).send({ message: 'Unauthorized' });
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
