import { supabase } from './supabase';
import { decrypt, decryptIfPresent } from '../utils/encryption';

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
  const { data, error } = await supabase.functions.invoke('patient-write', {
    body: { action: 'create', doctorId, payload },
  });

  if (error || !data?.row) throw new Error(error?.message || 'Hasta oluşturulamadı');
  return mapPatient(data.row);
}

export async function updatePatient(id, doctorId, payload) {
  const { data, error } = await supabase.functions.invoke('patient-write', {
    body: { action: 'update', id, doctorId, payload },
  });

  if (error || !data?.row) throw new Error(error?.message || 'Hasta güncellenemedi');
  return mapPatient(data.row);
}

export async function deletePatient(id, doctorId) {
  const { error } = await supabase.functions.invoke('patient-write', {
    body: { action: 'delete', id, doctorId },
  });
  if (error) throw new Error(error.message);
}
