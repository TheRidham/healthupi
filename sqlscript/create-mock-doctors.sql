-- ============================================================================
-- CREATE MOCK DOCTORS FOR DEVELOPMENT
-- ============================================================================

-- Insert auth users for doctors (needed for foreign key constraint)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000010', 'rahul.sharma@healthupi.com', crypt('mock123', gen_salt('bf')), now(), '{"provider": "email"}', '{"full_name": "Dr. Rahul Sharma"}', now(), now()),
  ('00000000-0000-0000-0000-000000000011', 'priya.patel@healthupi.com', crypt('mock123', gen_salt('bf')), now(), '{"provider": "email"}', '{"full_name": "Dr. Priya Patel"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert doctor profile for Rahul Sharma
INSERT INTO public.doctor_profiles (
  id,
  user_id,
  first_name,
  last_name,
  photo_url,
  specialization,
  experience_years,
  about,
  base_fee,
  languages,
  qualifications,
  clinic_name,
  address,
  city,
  state,
  zip,
  phone,
  email,
  availability,
  member_since,
  patients_served,
  rating,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000010',
  'Rahul',
  'Sharma',
  '/images/doctor-avatar.jpg',
  'General Physician',
  10,
  'Experienced general physician specializing in primary care, preventive medicine, and chronic disease management.',
  500,
  ARRAY['English', 'Hindi'],
  ARRAY['MBBS - AIIMS Delhi', 'MD - General Medicine - PGI Chandigarh'],
  'City Health Clinic',
  '123 Main Street',
  'Delhi',
  'DL',
  '110001',
  '+91 11 1234 5678',
  'rahul.sharma@healthupi.com',
  'online',
  CURRENT_DATE - INTERVAL '2 years',
  120,
  4.5,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET updated_at = now();

-- Insert doctor profile for Priya Patel
INSERT INTO public.doctor_profiles (
  id,
  user_id,
  first_name,
  last_name,
  photo_url,
  specialization,
  experience_years,
  about,
  base_fee,
  languages,
  qualifications,
  clinic_name,
  address,
  city,
  state,
  zip,
  phone,
  email,
  availability,
  member_since,
  patients_served,
  rating,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000011',
  'Priya',
  'Patel',
  '/images/doctor-avatar.jpg',
  'Dermatologist',
  8,
  'Expert dermatologist providing comprehensive skincare solutions, treating acne, eczema, and other skin conditions.',
  600,
  ARRAY['English', 'Hindi', 'Gujarati'],
  ARRAY['MBBS - KEM Mumbai', 'MD - Dermatology - JJ Hospital Mumbai'],
  'Skin Care Center',
  '456 Park Avenue',
  'Mumbai',
  'MH',
  '400001',
  '+91 22 2345 6789',
  'priya.patel@healthupi.com',
  'online',
  CURRENT_DATE - INTERVAL '1 year',
  85,
  4.7,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET updated_at = now();

-- Insert mock services
INSERT INTO public.services (id, name, type, description, price, duration_minutes, icon) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Video Consultation', 'service', 'Online video consultation with doctor', 500, 30, 'Video'),
  ('00000000-0000-0000-0000-000000000002', 'Chat Consultation', 'service', 'Text-based consultation with doctor', 300, 30, 'MessageSquare'),
  ('00000000-0000-0000-0000-000000000003', 'Home Visit', 'service', 'Doctor visits you at your home', 1500, 60, 'Home'),
  ('00000000-0000-0000-0000-000000000004', 'Emergency Consultation', 'service', 'Urgent consultation within 30 minutes', 800, 30, 'Siren'),
  ('00000000-0000-0000-0000-000000000005', 'Health Subscription', 'service', 'Annual health subscription', 2000, 365, 'CreditCard'),
  ('00000000-0000-0000-0000-000000000006', 'Follow-up', 'followup', 'Follow-up consultation after previous appointment', 200, 15, 'RotateCcw'),
  ('00000000-0000-0000-0000-000000000007', 'Follow-up Video', 'followup', 'Follow-up via video consultation', 300, 20, 'Video'),
  ('00000000-0000-0000-0000-000000000008', 'Follow-up Chat', 'followup', 'Follow-up via chat', 150, 15, 'MessageSquare')
ON CONFLICT (id) DO NOTHING;

-- Link services to doctors (doctor_services junction table)
INSERT INTO public.doctor_services (doctor_id, service_id, enabled, fee) VALUES
  -- Rahul Sharma services
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', true, 500),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', true, 300),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000003', true, 1500),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000006', true, 200),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000007', true, 300),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000008', true, 150),
  -- Priya Patel services
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', true, 600),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', true, 400),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', true, 1800),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000006', true, 250),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000007', true, 350),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000008', true, 200)
ON CONFLICT (doctor_id, service_id) DO NOTHING;

-- Verify inserted data
SELECT 'Doctors' as type, user_id, first_name, last_name, specialization, email FROM public.doctor_profiles WHERE user_id IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011')
UNION ALL
SELECT 'Services' as type, id, name, type as specialization, NULL, NULL as email FROM public.services WHERE id::text LIKE '00000000-0000-0000-0000-00000000000%';