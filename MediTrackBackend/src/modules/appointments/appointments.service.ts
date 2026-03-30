import type { CreateAppointmentInput } from './appointments.schemas.js';

export type Appointment = {
  id: string;
  doctorId: string;
  patientName: string;
  phone: string;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
};

const appointments: Appointment[] = [];

export function listAppointments(doctorId: string): Appointment[] {
  return appointments.filter((item) => item.doctorId === doctorId);
}

export function createAppointment(doctorId: string, payload: CreateAppointmentInput): Appointment {
  const conflict = appointments.find(
    (item) => item.doctorId === doctorId && item.date === payload.date && item.time === payload.time,
  );

  if (conflict) {
    throw new Error('APPOINTMENT_CONFLICT');
  }

  const appointment: Appointment = {
    id: `apt-${appointments.length + 1}`,
    doctorId,
    patientName: payload.patientName,
    phone: payload.phone,
    date: payload.date,
    time: payload.time,
    notes: payload.notes ?? '',
    createdAt: new Date().toISOString(),
  };

  appointments.push(appointment);
  return appointment;
}
