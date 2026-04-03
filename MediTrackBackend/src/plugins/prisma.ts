import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function registerPrisma(app: FastifyInstance) {
  // Prisma connects lazily, but let's verify connectivity
  await prisma.$connect();
  app.log.info('Prisma connected to database');

  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
    await pool.end();
    app.log.info('Prisma disconnected');
  });
}

export { prisma };

// Fastify type augmentation
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
