import { FastifyInstance } from 'fastify';
import { CreatePatientBody, UpdatePatientBody, PatientSchema } from './patients.schemas.js';
import * as patientsService from './patients.service.js';
import { Type } from '@sinclair/typebox';

export default async function patientsRoutes(app: FastifyInstance) {
  // All patient routes require authentication and doctor role
  app.addHook('preValidation', app.authenticate);
  app.addHook('preHandler', async (request, reply) => {
    if (request.user?.role !== 'doctor') {
      return reply.code(403).send({ error: 'FORBIDDEN', message: 'Only doctors can access patients' });
    }
  });

  app.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Array(PatientSchema),
        },
      },
    },
    async (request, reply) => {
      const doctorId = request.user!.userId;
      const patients = await patientsService.listPatients(doctorId);
      return patients;
    }
  );

  app.get(
    '/:id',
    {
      schema: {
        params: Type.Object({ id: Type.String() }),
        response: {
          200: PatientSchema,
          404: Type.Object({ error: Type.String() })
        },
      },
    },
    async (request, reply) => {
      const doctorId = request.user!.userId;
      const { id } = request.params as { id: string };
      const patient = await patientsService.getPatient(id, doctorId);
      if (!patient) return reply.code(404).send({ error: 'Patient not found' });
      return patient;
    }
  );

  app.post(
    '/',
    {
      schema: {
        body: CreatePatientBody,
        response: {
          201: PatientSchema,
        },
      },
    },
    async (request, reply) => {
      const doctorId = request.user!.userId;
      const patient = await patientsService.createPatient(doctorId, request.body as any);
      return reply.code(201).send(patient);
    }
  );

  app.patch(
    '/:id',
    {
      schema: {
        params: Type.Object({ id: Type.String() }),
        body: UpdatePatientBody,
        response: {
          200: PatientSchema,
          404: Type.Object({ error: Type.String() })
        },
      },
    },
    async (request, reply) => {
      const doctorId = request.user!.userId;
      const { id } = request.params as { id: string };
      try {
        const patient = await patientsService.updatePatient(id, doctorId, request.body as any);
        return patient;
      } catch (err: any) {
        if (err.message === 'NOT_FOUND') {
          return reply.code(404).send({ error: 'Patient not found' });
        }
        throw err;
      }
    }
  );

  app.delete(
    '/:id',
    {
      schema: {
        params: Type.Object({ id: Type.String() }),
        response: {
          204: Type.Null(),
          404: Type.Object({ error: Type.String() })
        },
      },
    },
    async (request, reply) => {
      const doctorId = request.user!.userId;
      const { id } = request.params as { id: string };
      try {
        await patientsService.deletePatient(id, doctorId);
        return reply.code(204).send();
      } catch (err: any) {
        if (err.message === 'NOT_FOUND') {
          return reply.code(404).send({ error: 'Patient not found' });
        }
        throw err;
      }
    }
  );
}
