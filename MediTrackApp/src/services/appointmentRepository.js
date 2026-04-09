import { supabase } from './supabase';
import { decrypt, decryptIfPresent } from '../utils/encryption';

function mapAppointment(row) {
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

export async function listAppointments(doctorId) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw new Error(error.message);
  return data.map(mapAppointment);
}

export async function createAppointment(doctorId, payload) {
  const { data, error } = await supabase.functions.invoke('appointment-write', {
    body: { action: 'create', doctorId, payload },
  });

  if (error || !data?.row) {
    const code = data?.code || error?.message;
    if (code === 'APPOINTMENT_CONFLICT') {
      const err = new Error('APPOINTMENT_CONFLICT');
      err.code = 'APPOINTMENT_CONFLICT';
      throw err;
    }
    throw new Error(error?.message || 'Randevu oluşturulamadı');
  }
  return mapAppointment(data.row);
}

export async function updateAppointment(doctorId, appointmentId, payload) {
  const { data, error } = await supabase.functions.invoke('appointment-write', {
    body: { action: 'update', doctorId, appointmentId, payload },
  });

  if (error || !data?.row) throw new Error(error?.message || 'Randevu güncellenemedi');
  return mapAppointment(data.row);
}

export async function deleteAppointment(doctorId, appointmentId) {
  const { error } = await supabase.functions.invoke('appointment-write', {
    body: { action: 'delete', doctorId, appointmentId },
  });
  if (error) throw new Error(error.message);
}
