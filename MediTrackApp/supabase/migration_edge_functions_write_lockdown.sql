-- =============================================================================
-- Edge Functions write-lockdown
-- Amaç: clients only read, writes go through edge functions (service role)
-- =============================================================================

-- Patients: direct client writes are disabled.
DROP POLICY IF EXISTS "patients_insert_active_only" ON public.patients;
DROP POLICY IF EXISTS "patients_update_own" ON public.patients;
DROP POLICY IF EXISTS "patients_delete_own" ON public.patients;

-- Appointments: direct client writes are disabled.
DROP POLICY IF EXISTS "appointments_insert_active_only" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete_own" ON public.appointments;

-- Users: direct admin update from client is disabled.
DROP POLICY IF EXISTS "users_update_as_admin" ON public.users;

