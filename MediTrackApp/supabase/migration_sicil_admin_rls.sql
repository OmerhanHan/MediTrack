-- =============================================================================
-- Mevcut projeyi SIFIRDAN kurmadan güncellemek için (dikkatli uygulayın)
-- Önce yedek alın. Mümkünse doğrudan fresh_install.sql tercih edin.
-- =============================================================================

-- 1) Sicil sütunu + sıra + otomatik atama (tablolar eski şemadaysa)
CREATE SEQUENCE IF NOT EXISTS public.user_sicil_seq START WITH 1;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sicil text;

UPDATE public.users SET sicil = 'MT-' || lpad(nextval('public.user_sicil_seq')::text, 6, '0')
WHERE sicil IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_sicil_unique ON public.users (sicil);

ALTER TABLE public.users ALTER COLUMN sicil SET NOT NULL;

-- Tetikleyiciler (varsa önce kaldırın)
DROP TRIGGER IF EXISTS trg_users_assign_sicil ON public.users;
DROP TRIGGER IF EXISTS trg_users_protect_sicil ON public.users;
DROP FUNCTION IF EXISTS public.assign_user_sicil() CASCADE;
DROP FUNCTION IF EXISTS public.protect_user_sicil() CASCADE;

CREATE OR REPLACE FUNCTION public.assign_user_sicil()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.sicil IS NULL OR NEW.sicil = '' THEN
    NEW.sicil := 'MT-' || lpad(nextval('public.user_sicil_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_user_sicil()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.sicil IS DISTINCT FROM OLD.sicil THEN
    RAISE EXCEPTION 'Sicil numarası değiştirilemez';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_assign_sicil
  BEFORE INSERT ON public.users FOR EACH ROW EXECUTE PROCEDURE public.assign_user_sicil();

CREATE TRIGGER trg_users_protect_sicil
  BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.protect_user_sicil();

-- 2) is_admin + yönetici RLS (politikaları elle düşürüp yeniden oluşturun)
--    Mevcut policy isimlerinize göre DROP POLICY if exists ... ekleyin.
--    Ardından fresh_install.sql içindeki is_admin ve policy bölümünü kopyalayın.
