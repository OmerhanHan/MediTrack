import { randomUUID } from 'expo-crypto';
import { supabase } from './supabase';
import { encrypt, decrypt, encryptIfPresent, decryptIfPresent } from '../utils/encryption';

function newRecordId() {
  return randomUUID().replace(/-/g, '').slice(0, 25);
}

function mapPatient(row) {
  return {
    id: row.id,
    name: decrypt(row.encrypted_name),
    phone: decrypt(row.encrypted_phone),
    email: decryptIfPresent(row.encrypted_email),
    notes: decryptIfPresent(row.encrypted_notes),
    birthDate: row.birth_date ? new Date(row.birth_date).toISOString() : null,
    gender: row.gender,
    doctorId: row.doctor_id,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listPatients(doctorId) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(mapPatient);
}

export async function createPatient(doctorId, payload) {
  const { data: row, error } = await supabase
    .from('patients')
    .insert({
      id: newRecordId(),
      doctor_id: doctorId,
      encrypted_name: encrypt(payload.name),
      encrypted_phone: encrypt(payload.phone),
      encrypted_email: encryptIfPresent(payload.email),
      encrypted_notes: encryptIfPresent(payload.notes),
      birth_date: payload.birthDate ? new Date(payload.birthDate).toISOString() : null,
      gender: payload.gender || null,
    })
    .select()
    .single();

  if (error || !row) throw new Error(error?.message || 'Hasta oluşturulamadı');
  return mapPatient(row);
}

export async function updatePatient(id, doctorId, payload) {
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('id', id)
    .eq('doctor_id', doctorId)
    .single();

  if (!existing) throw new Error('NOT_FOUND');

  const updateData = {};
  if (payload.name !== undefined) updateData.encrypted_name = encrypt(payload.name);
  if (payload.phone !== undefined) updateData.encrypted_phone = encrypt(payload.phone);
  if (payload.email !== undefined) updateData.encrypted_email = encryptIfPresent(payload.email);
  if (payload.notes !== undefined) updateData.encrypted_notes = encryptIfPresent(payload.notes);
  if (payload.birthDate !== undefined) {
    updateData.birth_date = payload.birthDate ? new Date(payload.birthDate).toISOString() : null;
  }
  if (payload.gender !== undefined) updateData.gender = payload.gender;

  const { data: row, error } = await supabase
    .from('patients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !row) throw new Error(error?.message || 'Hasta güncellenemedi');
  return mapPatient(row);
}

export async function deletePatient(id, doctorId) {
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('id', id)
    .eq('doctor_id', doctorId)
    .single();

  if (!existing) throw new Error('NOT_FOUND');

  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
