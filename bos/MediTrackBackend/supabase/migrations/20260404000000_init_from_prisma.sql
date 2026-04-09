-- Supabase Migration Script
-- Generates tables, RLS policies, and imports existing Prisma data.

-- 1. Create Tables
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  old_id text, -- Keep original Prisma cuid for relations during migration
  email text UNIQUE NOT NULL,
  role text DEFAULT 'doctor',
  first_name text NOT NULL,
  last_name text NOT NULL,
  title text,
  department text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.patients (
  id text PRIMARY KEY,
  encrypted_name text NOT NULL,
  encrypted_phone text NOT NULL,
  encrypted_email text,
  encrypted_notes text,
  birth_date timestamptz,
  gender text,
  doctor_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.appointments (
  id text PRIMARY KEY,
  doctor_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id text REFERENCES public.patients(id) ON DELETE SET NULL,
  encrypted_name text NOT NULL,
  encrypted_phone text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  encrypted_notes text,
  status text DEFAULT 'upcoming',
  type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (doctor_id, date, time)
);

CREATE TABLE public.audit_logs (
  id text PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text,
  metadata text,
  ip_address text,
  timestamp timestamptz DEFAULT now()
);

-- RLS (Row Level Security) - Basic setup (allow all for authenticated users temporarily for smooth transition)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions for authenticated users" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all actions for authenticated users" ON public.patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all actions for authenticated users" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all actions for authenticated users" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- 2. Data Migration
-- Users

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  'c50a4f18-326b-4b54-b827-a46212c389a9', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'doktor@meditrack.app',
  '$2b$12$DqVmi4nLHKMepHyoR.6F2.m7gZclG0cKI0rpxurXKf3Cm0XAWxafC',
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '2026-04-03T06:58:42.401Z',
  '2026-04-03T06:58:42.401Z',
  '', '', '', ''
);

INSERT INTO public.users (id, old_id, email, role, first_name, last_name, title, department, avatar_url, is_active, created_at, updated_at)
VALUES (
  'c50a4f18-326b-4b54-b827-a46212c389a9', 'cmnijylwh0000xhuvpw2nsm5i', 'doktor@meditrack.app', 'doctor',
  'Selin', 'Yılmaz',
  'Uzman Doktor',
  'Kardiyoloji',
  NULL,
  true,
  '2026-04-03T06:58:42.401Z',
  '2026-04-03T06:58:42.401Z'
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  'afae50ab-02d8-4d67-a0e8-46ea8e38b8f1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'personel@meditrack.app',
  '$2b$12$DqVmi4nLHKMepHyoR.6F2.m7gZclG0cKI0rpxurXKf3Cm0XAWxafC',
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '2026-04-03T06:58:42.415Z',
  '2026-04-03T06:58:42.415Z',
  '', '', '', ''
);

INSERT INTO public.users (id, old_id, email, role, first_name, last_name, title, department, avatar_url, is_active, created_at, updated_at)
VALUES (
  'afae50ab-02d8-4d67-a0e8-46ea8e38b8f1', 'cmnijylwv0001xhuvrrquigww', 'personel@meditrack.app', 'staff',
  'Ayşe', 'Kara',
  'Klinik Personeli',
  'Kardiyoloji',
  NULL,
  true,
  '2026-04-03T06:58:42.415Z',
  '2026-04-03T06:58:42.415Z'
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  'e7314fc6-8458-4485-9fad-98f2dd546671', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'admin@meditrack.app',
  '$2b$12$DqVmi4nLHKMepHyoR.6F2.m7gZclG0cKI0rpxurXKf3Cm0XAWxafC',
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '2026-04-03T06:58:42.420Z',
  '2026-04-03T06:58:42.420Z',
  '', '', '', ''
);

INSERT INTO public.users (id, old_id, email, role, first_name, last_name, title, department, avatar_url, is_active, created_at, updated_at)
VALUES (
  'e7314fc6-8458-4485-9fad-98f2dd546671', 'cmnijylx00002xhuvr6zkf8vf', 'admin@meditrack.app', 'admin',
  'Mehmet', 'Demir',
  'Sistem Yöneticisi',
  'IT',
  NULL,
  true,
  '2026-04-03T06:58:42.420Z',
  '2026-04-03T06:58:42.420Z'
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  'c461a0da-59a7-449b-a710-74cd14e68275', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'omer@meditrack.com',
  '$2b$12$IJ9fxUk9M/UE4THI6XFuR.udb61ZpXgURojx3wfUvSq8WyeVn4dzO',
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '2026-04-03T13:01:36.552Z',
  '2026-04-03T13:01:36.552Z',
  '', '', '', ''
);

INSERT INTO public.users (id, old_id, email, role, first_name, last_name, title, department, avatar_url, is_active, created_at, updated_at)
VALUES (
  'c461a0da-59a7-449b-a710-74cd14e68275', 'cmniwxay00000cyuvq77syjz0', 'omer@meditrack.com', 'doctor',
  'Ömer', 'Sezgin',
  'Doktor',
  'Bilinmiyor',
  NULL,
  true,
  '2026-04-03T13:01:36.552Z',
  '2026-04-03T13:01:36.552Z'
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  '8d7bcec6-69f1-4214-9154-358e8629e048', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'den@den.com',
  '$2b$12$7L8IvubaXkuYUx0y3qbDpOJXQflZwEeK.Lw7nBatpRkgywd4jTN5e',
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '2026-04-03T13:16:03.961Z',
  '2026-04-03T13:16:03.961Z',
  '', '', '', ''
);

INSERT INTO public.users (id, old_id, email, role, first_name, last_name, title, department, avatar_url, is_active, created_at, updated_at)
VALUES (
  '8d7bcec6-69f1-4214-9154-358e8629e048', 'cmnixfw8p000rcyuvav1hbhut', 'den@den.com', 'doctor',
  'Ali', 'Bilinmiyor',
  'Pratisyen Hekim',
  'İç Hastalıkları (Dahiliye)',
  NULL,
  true,
  '2026-04-03T13:16:03.961Z',
  '2026-04-03T13:16:03.961Z'
);

INSERT INTO public.appointments (id, doctor_id, patient_id, encrypted_name, encrypted_phone, date, time, encrypted_notes, status, type, created_at, updated_at)
VALUES (
  'cmniwxb6g0004cyuvhv039hg5',
  'c461a0da-59a7-449b-a710-74cd14e68275',
  NULL,
  'b14d5dd1f438582b58caa1c6201ca93e:5da44d80e453e2f8249ce58e2dd83a6a:5cc1cc01906cb1cf9f',
  'bb730f8929170280e4aea67afe2017a4:b2253d7f3f0ed69525402be8739d109c:9ad5be1559a93b9aa9339d',
  '2026-05-20',
  '13:00',
  'ed429623a286c134fd8c9670ec837169:11974acc4eb4795be296a41809615824:108a095955ca6179faa5624468e0f815de86e4f0ea0e',
  'upcoming',
  'Cilt',
  '2026-04-03T13:01:36.856Z',
  '2026-04-03T13:01:36.856Z'
);

INSERT INTO public.appointments (id, doctor_id, patient_id, encrypted_name, encrypted_phone, date, time, encrypted_notes, status, type, created_at, updated_at)
VALUES (
  'cmnixh9kx000ucyuv3ohag3u6',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  NULL,
  '12cc226fde065fc26d3fa612e297a7bd:914aac8e88c95e5a894a2006aa64c275:c26e82b5a6',
  '076d5dc769b4c163121917279e10d671:a4a720ac4597b69388cfe007b22dc7c2:9da0e28603de16e44a5907',
  '2026-04-04',
  '16:17',
  'f4bb0644ae06128d55dd6272526efc3f:85df64f180e9d4a9c1ffc28506523910:bd77cc16893ad50c39d0',
  'upcoming',
  'Dneme',
  '2026-04-03T13:17:07.905Z',
  '2026-04-03T13:17:07.905Z'
);

INSERT INTO public.appointments (id, doctor_id, patient_id, encrypted_name, encrypted_phone, date, time, encrypted_notes, status, type, created_at, updated_at)
VALUES (
  'cmnixij28000zcyuv3msss58p',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  NULL,
  'a5fb08e1a8294be5d3e92684f6bf9946:2fde54683cdc1e50c4404d0fa43fba8b:b01b104f057573',
  '152d02e1d02a30dfd2faa372b224421b:54a42dbe48b9a7194ef3bd4762835694:ec155ca7d637bed37e04d1',
  '2026-04-04',
  '16:20',
  '9836175ed46f2e9f30a46fabf4b36c67:1bae9b60aa24486a18cc6085554c717b:0fddab',
  'upcoming',
  'Van',
  '2026-04-03T13:18:06.848Z',
  '2026-04-03T13:18:06.848Z'
);

INSERT INTO public.appointments (id, doctor_id, patient_id, encrypted_name, encrypted_phone, date, time, encrypted_notes, status, type, created_at, updated_at)
VALUES (
  'cmnixt07a0018cyuvt80y17sn',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  NULL,
  '6a7b4dfe2d2013954d2883905f433e85:28a935956ac3bc7e1852db1f97b6a868:855f5fdaa5',
  'eeeeced2bd0dc7d5aae476cf26ade526:36dad092b5c50d7bad7f37d4ab8df563:a567b3f6ca083da47e550a2800',
  '2026-04-03',
  '16:27',
  '4121ff5552fc58da4af0898f7d57c387:8a717624ae556978402d3097ccada031:0bba17328f19',
  'upcoming',
  'Deneme',
  '2026-04-03T13:26:15.622Z',
  '2026-04-03T13:26:15.622Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniuidmt0000zwuv7qj284jh',
  NULL,
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T11:54:00.965Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniupxx50001zwuvatgn5jr4',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T11:59:53.849Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniuq2wf0002zwuvn06ple8d',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T12:00:00.304Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxayw0001cyuvuk8iupg7',
  NULL,
  'POST /api/v1/auth/register',
  '/api/v1/auth/register',
  '{"statusCode":201,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:36.584Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxb5m0002cyuvu8yspsxr',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:36.826Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxb610003cyuv7rjognx3',
  'c461a0da-59a7-449b-a710-74cd14e68275',
  'GET /api/v1/auth/me',
  '/api/v1/auth/me',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:36.841Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxb6k0005cyuvvbccmjt9',
  'c461a0da-59a7-449b-a710-74cd14e68275',
  'POST /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":201,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:36.860Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxb6w0006cyuv6at3kal4',
  'c461a0da-59a7-449b-a710-74cd14e68275',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:36.872Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxjr60007cyuvhh0xsoiw',
  NULL,
  'POST /api/v1/auth/register',
  '/api/v1/auth/register',
  '{"statusCode":409,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:47.970Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxjx40008cyuvg5l54m9x',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:48.184Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxjxf0009cyuvo12kaclp',
  'c461a0da-59a7-449b-a710-74cd14e68275',
  'GET /api/v1/auth/me',
  '/api/v1/auth/me',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:48.195Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxjxr000acyuv9okvmyf2',
  'c461a0da-59a7-449b-a710-74cd14e68275',
  'POST /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":409,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:48.207Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwxjy0000bcyuvsrivwc1w',
  'c461a0da-59a7-449b-a710-74cd14e68275',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"curl/8.7.1"}',
  '127.0.0.1',
  '2026-04-03T13:01:48.216Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwzgbt000ccyuvydekms6p',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:03:16.841Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwzuig000dcyuv6ao1ebjr',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:03:35.224Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwzwut000ecyuvdiezokc8',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:03:38.261Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmniwzyck000fcyuvfglgizop',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:03:40.197Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnix0mo9000gcyuv173cuuay',
  NULL,
  'POST /api/v1/auth/register',
  '/api/v1/auth/register',
  '{"statusCode":409,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:04:11.721Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnix65i6000hcyuvizzjbgzc',
  NULL,
  'POST /api/v1/auth/register',
  '/api/v1/auth/register',
  '{"statusCode":400,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:08:29.406Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnix6bnl000icyuvk5z4bp4t',
  NULL,
  'POST /api/v1/auth/register',
  '/api/v1/auth/register',
  '{"statusCode":400,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:08:37.377Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnix70ka000jcyuvmzg1p21t',
  NULL,
  'POST /api/v1/auth/register',
  '/api/v1/auth/register',
  '{"statusCode":400,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:09:09.658Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnix80tz000kcyuvjcgk46or',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:09:56.663Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnix8fvc000lcyuvxhgo520l',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:10:16.152Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnix8n9j000mcyuvwvjvfbi7',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:10:25.735Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnix8oii000ncyuvw79v8dll',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:10:27.354Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixb07v000ocyuvu1oqepi8',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:12:15.835Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixdrq0000pcyuvab6vxkj5',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:14:24.792Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixetrk000qcyuv43xqlg8t',
  NULL,
  'POST /api/v1/auth/login',
  '/api/v1/auth/login',
  '{"statusCode":401,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:15:14.096Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixfw8y000scyuvqikbz2sl',
  NULL,
  'POST /api/v1/auth/register',
  '/api/v1/auth/register',
  '{"statusCode":201,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:16:03.970Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixfwbe000tcyuv27webxdj',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:16:04.058Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixh9l4000vcyuvtuouvr3p',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'POST /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":201,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:17:07.912Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixh9n1000wcyuvxonjlm3w',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:17:07.981Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixh9n8000xcyuvvfuvncwz',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:17:07.988Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixhbvu000ycyuvpld2x2hw',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:17:10.890Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixij2f0010cyuv96nubqxv',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'POST /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":201,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:18:06.855Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixij600011cyuvw28p5i1f',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:18:06.984Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixij680012cyuvrt8of302',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:18:06.992Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixjm0y0013cyuv6babjyen',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:18:57.346Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixn7fc0014cyuv3ujsx7xp',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:21:45.048Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixnfl50015cyuv7dlflwab',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:21:55.625Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixr29l0016cyuvyvx4ghtf',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:24:44.985Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixs30e0017cyuvwar5avp7',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:25:32.606Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixt07h0019cyuvju1raoqc',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'POST /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":201,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:26:15.629Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixt09i001acyuvhju11wo4',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:26:15.702Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixt09q001bcyuv21v0zcih',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:26:15.710Z'
);

INSERT INTO public.audit_logs (id, user_id, action, resource, metadata, ip_address, timestamp)
VALUES (
  'cmnixu6i2001ccyuvuife6xru',
  '8d7bcec6-69f1-4214-9154-358e8629e048',
  'GET /api/v1/appointments',
  '/api/v1/appointments',
  '{"statusCode":200,"ip":"127.0.0.1","userAgent":"Expo/54.0.6 CFNetwork/3860.200.71 Darwin/25.3.0"}',
  '127.0.0.1',
  '2026-04-03T13:27:10.442Z'
);
