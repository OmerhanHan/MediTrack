import Fastify from 'fastify';
import { authRoutes } from './modules/auth/auth.routes.js';
import { appointmentRoutes } from './modules/appointments/appointments.routes.js';
import { registerAudit } from './plugins/audit.js';
import { registerAuth } from './plugins/auth.js';
import { registerAuthorization } from './plugins/authorization.js';
import { registerSecurity } from './plugins/security.js';
export async function buildApp() {
    const app = Fastify({ logger: true });
    await registerSecurity(app);
    await registerAuth(app);
    await registerAuthorization(app);
    await registerAudit(app);
    app.setErrorHandler((error, request, reply) => {
        request.log.error({ err: error }, 'Unhandled application error');
        reply.code(500).send({ message: 'Internal server error' });
    });
    app.get('/health', async () => ({ status: 'ok' }));
    await app.register(authRoutes, { prefix: '/api/v1' });
    await app.register(appointmentRoutes, { prefix: '/api/v1' });
    return app;
}
