import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from '../config/env.js';
export async function registerSecurity(app) {
    await app.register(helmet, {
        contentSecurityPolicy: false,
    });
    await app.register(cors, {
        origin: env.CORS_ORIGIN,
        credentials: true,
    });
    await app.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
    });
}
