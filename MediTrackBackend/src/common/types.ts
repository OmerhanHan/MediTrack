import type { FastifyRequest } from 'fastify';

export type AppRole = 'doctor' | 'staff' | 'admin';

export type AuthUser = {
  userId: string;
  email: string;
  role: AppRole;
};

export type AuthenticatedRequest = FastifyRequest & {
  user: AuthUser;
};
