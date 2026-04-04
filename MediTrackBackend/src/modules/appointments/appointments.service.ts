import { supabase } from '../../config/supabase.js';
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
  doctor_id: string;
  encrypted_name: string;
  encrypted_phone: string;
  date: string;
  time: string;
  encrypted_notes: string | null;
  status: string;
  type: string | null;
  created_at: string;
}): AppointmentResponse {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    patientName: decrypt(row.encrypted_name),
    phone: decrypt(row.encrypted_phone),
    date: row.date,
    time: row.time,
    notes: decryptIfPresent(row.encrypted_notes) ?? '',
    status: row.status,
    type: row.type,
    createdAt: row.created_at,
  };
}

/**
 * List all appointments for a doctor, decrypted.
 */
export async function listAppointments(doctorId: string): Promise<AppointmentResponse[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw new Error(error.message);

  return data.map(decryptAppointment);
}

/**
 * Create an appointment with encrypted patient data.
 */
export async function createAppointment(
  doctorId: string,
  payload: CreateAppointmentInput,
): Promise<AppointmentResponse> {
  // Check for slot conflict (same doctor, same date+time)
  const { data: conflict } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctorId)
    .eq('date', payload.date)
    .eq('time', payload.time)
    .single();

  if (conflict) {
    throw new Error('APPOINTMENT_CONFLICT');
  }

  const { data: row, error } = await supabase
    .from('appointments')
    .insert({
      id: crypto.randomUUID().replace(/-/g, '').slice(0, 25), // Basic fallback ID mimicking cuid roughly, but Supabase handles defaults if we omitted, but our schema requires id text
      doctor_id: doctorId,
      encrypted_name: encrypt(payload.patientName),
      encrypted_phone: encrypt(payload.phone),
      date: payload.date,
      time: payload.time,
      encrypted_notes: encryptIfPresent(payload.notes),
      type: payload.notes?.split(' ')[0] || null,
      status: 'upcoming',
    })
    .select()
    .single();

  if (error || !row) throw new Error(error?.message || 'Failed to create appointment');

  // Get doctor details to include in SMS
  const { data: doctor } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', doctorId)
    .single();

  if (doctor) {
    const docName = `${doctor.first_name} ${doctor.last_name}`;
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
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('doctor_id', doctorId)
    .single();
    
  if (!existing) throw new Error('APPOINTMENT_NOT_FOUND');

  const data: any = {};
  if (payload.date) data.date = payload.date;
  if (payload.time) data.time = payload.time;
  if (payload.notes !== undefined) {
    data.encrypted_notes = encryptIfPresent(payload.notes);
    if (payload.notes) data.type = payload.notes.split(' ')[0];
  }
  if (payload.status) data.status = payload.status;

  const { data: row, error } = await supabase
    .from('appointments')
    .update(data)
    .eq('id', appointmentId)
    .select()
    .single();

  if (error || !row) throw new Error(error?.message || 'Failed to update appointment');

  return decryptAppointment(row);
}

export async function deleteAppointment(doctorId: string, appointmentId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('doctor_id', doctorId)
    .single();
    
  if (!existing) throw new Error('APPOINTMENT_NOT_FOUND');

  await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);
}
