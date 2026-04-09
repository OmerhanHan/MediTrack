import jwt from '@fastify/jwt';
import { env } from '../config/env.js';
export async function registerAuth(app) {
    await app.register(jwt, {
        secret: env.JWT_ACCESS_SECRET,
        sign: {
            expiresIn: env.JWT_ACCESS_TTL,
        },
    });
    app.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            reply.code(401).send({ message: 'Unauthorized' });
        }
    });
}
