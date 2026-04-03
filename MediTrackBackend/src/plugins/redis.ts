import { Redis } from 'ioredis';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

let redis: Redis;

export async function registerRedis(app: FastifyInstance) {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  await redis.connect();
  app.log.info('Redis connected');

  app.decorate('redis', redis);

  app.addHook('onClose', async () => {
    await redis.quit();
    app.log.info('Redis disconnected');
  });
}

export { redis };

// Fastify type augmentation
declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}
