import { prisma } from '../../plugins/prisma.js';
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
    name: decrypt(row.encryptedName),
    phone: decrypt(row.encryptedPhone),
    email: decryptIfPresent(row.encryptedEmail),
    notes: decryptIfPresent(row.encryptedNotes),
    birthDate: row.birthDate ? row.birthDate.toISOString() : null,
    gender: row.gender,
    doctorId: row.doctorId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listPatients(doctorId: string): Promise<PatientResponse[]> {
  const rows = await prisma.patient.findMany({
    where: { doctorId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(decryptPatient);
}

export async function getPatient(id: string, doctorId: string): Promise<PatientResponse | null> {
  const row = await prisma.patient.findFirst({
    where: { id, doctorId },
  });
  if (!row) return null;
  return decryptPatient(row);
}

export async function createPatient(
  doctorId: string,
  payload: CreatePatientInput
): Promise<PatientResponse> {
  const row = await prisma.patient.create({
    data: {
      doctorId,
      encryptedName: encrypt(payload.name),
      encryptedPhone: encrypt(payload.phone),
      encryptedEmail: encryptIfPresent(payload.email),
      encryptedNotes: encryptIfPresent(payload.notes),
      birthDate: payload.birthDate ? new Date(payload.birthDate) : null,
      gender: payload.gender || null,
    },
  });
  return decryptPatient(row);
}

export async function updatePatient(
  id: string,
  doctorId: string,
  payload: UpdatePatientInput
): Promise<PatientResponse> {
  const existing = await prisma.patient.findFirst({ where: { id, doctorId } });
  if (!existing) throw new Error('NOT_FOUND');

  const data: any = {};
  if (payload.name !== undefined) data.encryptedName = encrypt(payload.name);
  if (payload.phone !== undefined) data.encryptedPhone = encrypt(payload.phone);
  if (payload.email !== undefined) data.encryptedEmail = encryptIfPresent(payload.email);
  if (payload.notes !== undefined) data.encryptedNotes = encryptIfPresent(payload.notes);
  if (payload.birthDate !== undefined) data.birthDate = payload.birthDate ? new Date(payload.birthDate) : null;
  if (payload.gender !== undefined) data.gender = payload.gender;

  const row = await prisma.patient.update({
    where: { id },
    data,
  });
  return decryptPatient(row);
}

export async function deletePatient(id: string, doctorId: string): Promise<void> {
  const existing = await prisma.patient.findFirst({ where: { id, doctorId } });
  if (!existing) throw new Error('NOT_FOUND');

  await prisma.patient.delete({ where: { id } });
}
