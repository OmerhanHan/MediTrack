-- =============================================================================
-- Serverless güvenlik sertleştirmesi
-- - users.role ve users.account_status alanlarını non-admin değişikliklerine kapatır
-- - SQL Editor / service context (auth.uid() is null) güncellemelerini engellemez
-- - users_update_self policy'sini WITH CHECK ile güçlendirir
-- =============================================================================

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

    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        NEW.role := OLD.role;
      END IF;
    END IF;

    IF NEW.account_status IS DISTINCT FROM OLD.account_status THEN
      IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        NEW.account_status := OLD.account_status;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "users_update_self" ON public.users;
CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

