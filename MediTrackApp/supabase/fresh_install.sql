-- =============================================================================
-- MediTrack — Sıfırdan veritabanı (public şema)
-- Yeni kullanıcı: account_status = pending → yönetici onayı → active
-- =============================================================================

DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP FUNCTION IF EXISTS public.assign_user_sicil() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_user_row_rules() CASCADE;
DROP FUNCTION IF EXISTS public.protect_user_sicil() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

DROP SEQUENCE IF EXISTS public.user_sicil_seq CASCADE;

CREATE SEQUENCE public.user_sicil_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.assign_user_sicil()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.sicil IS NULL OR NEW.sicil = '' THEN
    NEW.sicil := 'MT-' || lpad(nextval('public.user_sicil_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  sicil text UNIQUE,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'doctor'
    CHECK (role IN ('doctor', 'staff', 'admin')),
  title text,
  department text,
  is_active boolean NOT NULL DEFAULT true,
  account_status text NOT NULL DEFAULT 'pending'
    CHECK (account_status IN ('pending', 'active', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
CREATE INDEX IF NOT EXISTS users_account_status_idx ON public.users (account_status);

CREATE TRIGGER trg_users_assign_sicil
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.assign_user_sicil();

ALTER TABLE public.users
  ALTER COLUMN sicil SET NOT NULL;

CREATE TABLE public.patients (
  id text PRIMARY KEY,
  doctor_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  encrypted_name text NOT NULL,
  encrypted_phone text NOT NULL,
  encrypted_email text,
  encrypted_notes text,
  birth_date timestamptz,
  gender text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS patients_doctor_id_idx ON public.patients (doctor_id);

CREATE TABLE public.appointments (
  id text PRIMARY KEY,
  doctor_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  encrypted_name text NOT NULL,
  encrypted_phone text NOT NULL,
  date date NOT NULL,
  "time" text NOT NULL,
  encrypted_notes text,
  status text NOT NULL DEFAULT 'upcoming',
  type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS appointments_doctor_id_idx ON public.appointments (doctor_id);
CREATE INDEX IF NOT EXISTS appointments_doctor_date_idx ON public.appointments (doctor_id, date);

CREATE UNIQUE INDEX IF NOT EXISTS appointments_doctor_slot_unique
  ON public.appointments (doctor_id, date, "time");

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' AND account_status = 'active' FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.enforce_user_row_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.sicil IS DISTINCT FROM OLD.sicil THEN
      RAISE EXCEPTION 'Sicil numarası değiştirilemez';
    END IF;
    IF NEW.account_status IS DISTINCT FROM OLD.account_status THEN
      IF NOT public.is_admin() THEN
        NEW.account_status := OLD.account_status;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_enforce_rules
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.enforce_user_row_rules();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_self_or_admin" ON public.users
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "users_insert_self" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_update_as_admin" ON public.users
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "patients_select_own_or_admin" ON public.patients
  FOR SELECT USING (doctor_id = auth.uid() OR public.is_admin());

CREATE POLICY "patients_insert_active_only" ON public.patients
  FOR INSERT WITH CHECK (
    doctor_id = auth.uid()
    AND (SELECT u.account_status FROM public.users u WHERE u.id = auth.uid()) = 'active'
  );

CREATE POLICY "patients_update_own" ON public.patients
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "patients_delete_own" ON public.patients
  FOR DELETE USING (doctor_id = auth.uid());

CREATE POLICY "appointments_select_own_or_admin" ON public.appointments
  FOR SELECT USING (doctor_id = auth.uid() OR public.is_admin());

CREATE POLICY "appointments_insert_active_only" ON public.appointments
  FOR INSERT WITH CHECK (
    doctor_id = auth.uid()
    AND (SELECT u.account_status FROM public.users u WHERE u.id = auth.uid()) = 'active'
  );

CREATE POLICY "appointments_update_own" ON public.appointments
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "appointments_delete_own" ON public.appointments
  FOR DELETE USING (doctor_id = auth.uid());

-- İlk yönetici: Authentication ile oluşturduktan sonra public.users satırında
-- account_status = 'active' ve role = 'admin' olmalı (onay bekleyen yönetici panelini açamaz).
