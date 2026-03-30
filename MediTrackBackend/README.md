# MediTrack Backend (Security-First Starter)

This backend is the initial implementation for a layered and secure architecture.

## Included in this starter

- Fastify server with `helmet`, `cors`, and `rate-limit`
- JWT access token auth and refresh token rotation (in-memory demo store)
- Auth routes:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `GET /api/v1/auth/me`
- Appointment routes:
  - `GET /api/v1/appointments`
  - `POST /api/v1/appointments`
- Slot conflict rule: same doctor cannot book same date+time twice

## Quick start

1. Copy env values:

```bash
cp .env.example .env
```

2. Run in development:

```bash
npm run dev
```

3. Health check:

```bash
curl http://localhost:4000/health
```

## Demo credentials

- Email: `doktor@meditrack.app`
- Password: `Password123!`

## Next implementation steps

1. Replace in-memory token store with Redis
2. Replace in-memory appointments with PostgreSQL + Prisma
3. Add RBAC policy middleware and audit logging
4. Add integration tests for auth and appointment conflict handling
5. Add CI security gates (SAST, dependency scan, secret scan)
