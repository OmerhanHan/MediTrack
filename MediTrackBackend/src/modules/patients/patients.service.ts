import { supabase } from '../../config/supabase.js';
import { encrypt, decrypt, encryptIfPresent, decryptIfPresent } from '../../common/encryption.js';
import { Static } from '@sinclair/typebox';
import { CreatePatientBody, UpdatePatientBody } from './patients.schemas.js';

type CreatePatientInput = Static<typeof CreatePatientBody>;
type UpdatePatientInput = Static<typeof UpdatePatientBody>;

export type PatientResponse = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  birthDate: string | null;
  gender: string | null;
  doctorId: string;
  createdAt: string;
};

/**
 * Decrypt a patient row from DB into a readable response.
 */
function decryptPatient(row: any): PatientResponse {
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

export async function listPatients(doctorId: string): Promise<PatientResponse[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data.map(decryptPatient);
}

export async function getPatient(id: string, doctorId: string): Promise<PatientResponse | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .eq('doctor_id', doctorId)
    .single();

  if (error || !data) return null;
  
  return decryptPatient(data);
}

export async function createPatient(
  doctorId: string,
  payload: CreatePatientInput
): Promise<PatientResponse> {
  const { data: row, error } = await supabase
    .from('patients')
    .insert({
      id: crypto.randomUUID().replace(/-/g, '').slice(0, 25), // Prisma cuid fallback
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

  if (error || !row) throw new Error(error?.message || 'Failed to create patient');

  return decryptPatient(row);
}

export async function updatePatient(
  id: string,
  doctorId: string,
  payload: UpdatePatientInput
): Promise<PatientResponse> {
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('id', id)
    .eq('doctor_id', doctorId)
    .single();
    
  if (!existing) throw new Error('NOT_FOUND');

  const updateData: any = {};
  if (payload.name !== undefined) updateData.encrypted_name = encrypt(payload.name);
  if (payload.phone !== undefined) updateData.encrypted_phone = encrypt(payload.phone);
  if (payload.email !== undefined) updateData.encrypted_email = encryptIfPresent(payload.email);
  if (payload.notes !== undefined) updateData.encrypted_notes = encryptIfPresent(payload.notes);
  if (payload.birthDate !== undefined) updateData.birth_date = payload.birthDate ? new Date(payload.birthDate).toISOString() : null;
  if (payload.gender !== undefined) updateData.gender = payload.gender;

  const { data: row, error } = await supabase
    .from('patients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !row) throw new Error(error?.message || 'Failed to update patient');

  return decryptPatient(row);
}

export async function deletePatient(id: string, doctorId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('id', id)
    .eq('doctor_id', doctorId)
    .single();
    
  if (!existing) throw new Error('NOT_FOUND');

  await supabase
    .from('patients')
    .delete()
    .eq('id', id);
}
