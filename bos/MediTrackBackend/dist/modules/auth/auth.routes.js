import { loginSchema, refreshSchema } from './auth.schemas.js';
import { login, rotateRefreshToken } from './auth.service.js';
export async function authRoutes(app) {
    app.post('/auth/login', async (request, reply) => {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.code(400).send({ message: 'Invalid request body', errors: parsed.error.flatten() });
        }
        const tokenSet = await login(app, parsed.data.email, parsed.data.password);
        if (!tokenSet) {
            return reply.code(401).send({ message: 'Invalid credentials' });
        }
        return reply.code(200).send(tokenSet);
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
        return reply.code(200).send({ user: request.user });
    });
}
