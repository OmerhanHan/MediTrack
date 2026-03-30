import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientName: z.string().min(2),
  phone: z.string().min(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(500).optional().default(''),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
