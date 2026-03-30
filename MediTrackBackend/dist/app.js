import Fastify from 'fastify';
import { authRoutes } from './modules/auth/auth.routes.js';
import { appointmentRoutes } from './modules/appointments/appointments.routes.js';
import { registerAuth } from './plugins/auth.js';
import { registerSecurity } from './plugins/security.js';
export async function buildApp() {
    const app = Fastify({ logger: true });
    await registerSecurity(app);
    await registerAuth(app);
    app.get('/health', async () => ({ status: 'ok' }));
    await app.register(authRoutes, { prefix: '/api/v1' });
    await app.register(appointmentRoutes, { prefix: '/api/v1' });
    return app;
}
