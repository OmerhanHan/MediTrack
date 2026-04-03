import type { FastifyInstance } from 'fastify';
import { createAppointmentSchema, updateAppointmentSchema } from './appointments.schemas.js';
import { createAppointment, listAppointments, updateAppointment, deleteAppointment } from './appointments.service.js';

export async function appointmentRoutes(app: FastifyInstance) {
  app.get('/appointments', { preHandler: [app.authenticate, app.requireRoles('doctor', 'staff', 'admin')] }, async (request, reply) => {
    const data = await listAppointments(request.user.userId);
    return reply.code(200).send({ data });
  });

  app.post('/appointments', { preHandler: [app.authenticate, app.requireRoles('doctor', 'staff')] }, async (request, reply) => {
    const parsed = createAppointmentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Invalid request body', errors: parsed.error.flatten() });
    }

    try {
      const created = await createAppointment(request.user.userId, parsed.data);
      return reply.code(201).send({ data: created });
    } catch (error) {
      if (error instanceof Error && error.message === 'APPOINTMENT_CONFLICT') {
        return reply.code(409).send({ message: 'Appointment slot is already occupied' });
      }
      return reply.code(500).send({ message: 'Unexpected error' });
    }
  });

  app.patch('/appointments/:id', { preHandler: [app.authenticate, app.requireRoles('doctor', 'staff')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateAppointmentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Invalid request body', errors: parsed.error.flatten() });
    }

    try {
      const updated = await updateAppointment(request.user.userId, id, parsed.data);
      return reply.code(200).send({ data: updated });
    } catch (error) {
      if (error instanceof Error && error.message === 'APPOINTMENT_NOT_FOUND') {
        return reply.code(404).send({ message: 'Appointment not found' });
      }
      return reply.code(500).send({ message: 'Unexpected error' });
    }
  });

  app.delete('/appointments/:id', { preHandler: [app.authenticate, app.requireRoles('doctor', 'staff')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await deleteAppointment(request.user.userId, id);
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'APPOINTMENT_NOT_FOUND') {
        return reply.code(404).send({ message: 'Appointment not found' });
      }
      return reply.code(500).send({ message: 'Unexpected error' });
    }
  });
}
