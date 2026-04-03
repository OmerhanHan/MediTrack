import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientName: z.string().min(2),
  phone: z.string().min(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(500).optional().default(''),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['upcoming', 'completed', 'cancelled']).optional(),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
