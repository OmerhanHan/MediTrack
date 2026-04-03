export async function registerAuthorization(app) {
    app.decorate('requireRoles', (...roles) => {
        const preHandler = async (request, reply) => {
            if (!request.user || !roles.includes(request.user.role)) {
                reply.code(403).send({ message: 'Forbidden' });
            }
        };
        return preHandler;
    });
}
