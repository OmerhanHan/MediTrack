import { prisma } from '../../plugins/prisma.js';
import { encrypt, decrypt, encryptIfPresent, decryptIfPresent } from '../../common/encryption.js';
import type { CreateAppointmentInput } from './appointments.schemas.js';
import { sendSms } from '../../services/sms.js';
import { smsTemplates } from '../../services/smsTemplates.js';

export type AppointmentResponse = {
  id: string;
  doctorId: string;
  patientName: string;
  phone: string;
  date: string;
  time: string;
  notes: string;
  status: string;
  type: string | null;
  createdAt: string;
};

/**
 * Decrypt an appointment row from DB into a readable response.
 */
function decryptAppointment(row: {
  id: string;
  doctorId: string;
  encryptedName: string;
  encryptedPhone: string;
  date: string;
  time: string;
  encryptedNotes: string | null;
  status: string;
  type: string | null;
  createdAt: Date;
}): AppointmentResponse {
  return {
    id: row.id,
    doctorId: row.doctorId,
    patientName: decrypt(row.encryptedName),
    phone: decrypt(row.encryptedPhone),
    date: row.date,
    time: row.time,
    notes: decryptIfPresent(row.encryptedNotes) ?? '',
    status: row.status,
    type: row.type,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * List all appointments for a doctor, decrypted.
 */
export async function listAppointments(doctorId: string): Promise<AppointmentResponse[]> {
  const rows = await prisma.appointment.findMany({
    where: { doctorId },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  return rows.map(decryptAppointment);
}

/**
 * Create an appointment with encrypted patient data.
 */
export async function createAppointment(
  doctorId: string,
  payload: CreateAppointmentInput,
): Promise<AppointmentResponse> {
  // Check for slot conflict (same doctor, same date+time)
  const conflict = await prisma.appointment.findUnique({
    where: {
      doctorId_date_time: {
        doctorId,
        date: payload.date,
        time: payload.time,
      },
    },
  });

  if (conflict) {
    throw new Error('APPOINTMENT_CONFLICT');
  }

  const row = await prisma.appointment.create({
    data: {
      doctorId,
      encryptedName: encrypt(payload.patientName),
      encryptedPhone: encrypt(payload.phone),
      date: payload.date,
      time: payload.time,
      encryptedNotes: encryptIfPresent(payload.notes),
      type: payload.notes?.split(' ')[0] || null,
      status: 'upcoming',
    },
  });

  // Get doctor details to include in SMS
  const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
  if (doctor) {
    const docName = `${doctor.firstName} ${doctor.lastName}`;
    const smsMsg = smsTemplates.appointmentCreated(docName, payload.date, payload.time);
    // Asynchronously send SMS (don't wait for completion)
    sendSms(payload.phone, smsMsg).catch(console.error);
  }

  return decryptAppointment(row);
}

export async function updateAppointment(
  doctorId: string,
  appointmentId: string,
  payload: { date?: string; time?: string; notes?: string; status?: string }
): Promise<AppointmentResponse> {
  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId }
  });
  if (!existing) throw new Error('APPOINTMENT_NOT_FOUND');

  const data: any = {};
  if (payload.date) data.date = payload.date;
  if (payload.time) data.time = payload.time;
  if (payload.notes !== undefined) {
    data.encryptedNotes = encryptIfPresent(payload.notes);
    if (payload.notes) data.type = payload.notes.split(' ')[0];
  }
  if (payload.status) data.status = payload.status;

  const row = await prisma.appointment.update({
    where: { id: appointmentId },
    data
  });

  return decryptAppointment(row);
}

export async function deleteAppointment(doctorId: string, appointmentId: string): Promise<void> {
  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId }
  });
  if (!existing) throw new Error('APPOINTMENT_NOT_FOUND');

  await prisma.appointment.delete({
    where: { id: appointmentId }
  });
}
