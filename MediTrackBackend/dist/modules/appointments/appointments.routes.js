import { createAppointmentSchema } from './appointments.schemas.js';
import { createAppointment, listAppointments } from './appointments.service.js';
export async function appointmentRoutes(app) {
    app.get('/appointments', { preHandler: [app.authenticate] }, async (request, reply) => {
        const data = listAppointments(request.user.userId);
        return reply.code(200).send({ data });
    });
    app.post('/appointments', { preHandler: [app.authenticate] }, async (request, reply) => {
        const parsed = createAppointmentSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.code(400).send({ message: 'Invalid request body', errors: parsed.error.flatten() });
        }
        try {
            const created = createAppointment(request.user.userId, parsed.data);
            return reply.code(201).send({ data: created });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'APPOINTMENT_CONFLICT') {
                return reply.code(409).send({ message: 'Appointment slot is already occupied' });
            }
            return reply.code(500).send({ message: 'Unexpected error' });
        }
    });
}
