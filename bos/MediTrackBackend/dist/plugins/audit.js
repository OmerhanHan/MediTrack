export async function registerAudit(app) {
    app.addHook('onResponse', async (request, reply) => {
        if (request.url.startsWith('/health')) {
            return;
        }
        request.log.info({
            event: 'audit.request.completed',
            method: request.method,
            path: request.url,
            statusCode: reply.statusCode,
            userId: request.user?.userId,
        }, 'Request completed');
    });
}
