import { randomUUID } from 'expo-crypto';
import { supabase } from './supabase';
import { encrypt, decrypt, encryptIfPresent, decryptIfPresent } from '../utils/encryption';

function newRecordId() {
  return randomUUID().replace(/-/g, '').slice(0, 25);
}

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
  const { data: conflict } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctorId)
    .eq('date', payload.date)
    .eq('time', payload.time)
    .maybeSingle();

  if (conflict) {
    const err = new Error('APPOINTMENT_CONFLICT');
    err.code = 'APPOINTMENT_CONFLICT';
    throw err;
  }

  const { data: row, error } = await supabase
    .from('appointments')
    .insert({
      id: newRecordId(),
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

  if (error || !row) throw new Error(error?.message || 'Randevu oluşturulamadı');
  return mapAppointment(row);
}

export async function updateAppointment(doctorId, appointmentId, payload) {
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('doctor_id', doctorId)
    .maybeSingle();

  if (!existing) throw new Error('APPOINTMENT_NOT_FOUND');

  const data = {};
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

  if (error || !row) throw new Error(error?.message || 'Randevu güncellenemedi');
  return mapAppointment(row);
}

export async function deleteAppointment(doctorId, appointmentId) {
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', appointmentId)
    .eq('doctor_id', doctorId)
    .maybeSingle();

  if (!existing) throw new Error('APPOINTMENT_NOT_FOUND');

  const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
  if (error) throw new Error(error.message);
}
