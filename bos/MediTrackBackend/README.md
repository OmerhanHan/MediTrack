
# MediTrack Backend (Security-First Starter)

This backend is the initial implementation for a layered and secure architecture.

## Included in this starter

- Fastify server with `helmet`, `cors`, and `rate-limit`
- JWT access token auth and refresh token rotation (in-memory demo store)
- Role-based authorization helpers (`doctor`, `staff`, `admin`)
- Basic audit logging hook for request lifecycle events
- Auth routes:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `GET /api/v1/auth/me`
- Appointment routes:
  - `GET /api/v1/appointments`
  - `POST /api/v1/appointments`
- Slot conflict rule: same doctor cannot book same date+time twice
- Appointment route permissions:
  - `GET /appointments`: `doctor`, `staff`, `admin`
  - `POST /appointments`: `doctor`, `staff`

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

- Doctor: `doktor@meditrack.app` / `Password123!`
- Staff: `personel@meditrack.app` / `Password123!`
- Admin: `admin@meditrack.app` / `Password123!`

## Next implementation steps

1. Replace in-memory token store with Redis
2. Replace in-memory appointments with PostgreSQL + Prisma
3. Replace demo users with DB-backed user/account model + password hashing
4. Add integration tests for auth and appointment conflict handling
5. Add CI security gates (SAST, dependency scan, secret scan)
