import { Type } from '@sinclair/typebox';

export const PatientSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  phone: Type.String(),
  email: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  birthDate: Type.Optional(Type.String({ format: 'date-time' })),
  gender: Type.Optional(Type.String()),
  doctorId: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});

export const CreatePatientBody = Type.Object({
  name: Type.String(),
  phone: Type.String(),
  email: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  birthDate: Type.Optional(Type.String()),
  gender: Type.Optional(Type.String())
});

export const UpdatePatientBody = Type.Partial(CreatePatientBody);
