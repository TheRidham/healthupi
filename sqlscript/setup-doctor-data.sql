-- ============================================================================
-- HealthUPI Database Setup Script
-- Run this to populate test data and fix schema issues
-- ============================================================================

-- 1. Add slug column to doctor_profiles (if not exists)
ALTER TABLE public.doctor_profiles 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 2. Add is_available column to time_slots if not exists
ALTER TABLE public.time_slots 
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- 3. Ensure services table has required default services
INSERT INTO public.services (id, name, type, description, price, duration_minutes, icon)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Video Call', 'service', 'One-on-one video consultation', 500, 30, 'video'),
  ('10000000-0000-0000-0000-000000000002', 'Chat', 'service', 'Text-based consultation', 200, 30, 'message'),
  ('10000000-0000-0000-0000-000000000003', 'Home Visit', 'service', 'In-person visit at your residence', 1500, 60, 'home'),
  ('10000000-0000-0000-0000-000000000004', 'Emergency', 'service', 'Urgent consultations (priority)', 2000, 30, 'alert'),
  ('10000000-0000-0000-0000-000000000005', 'Subscription', 'service', 'Monthly unlimited consultations', 3000, 0, 'credit-card'),
  ('10000000-0000-0000-0000-000000000006', 'Follow-up Video', 'followup', 'Video follow-up for returning patients', 300, 15, 'video'),
  ('10000000-0000-0000-0000-000000000007', 'Follow-up Chat', 'followup', 'Text follow-up for returning patients', 100, 15, 'message')
ON CONFLICT (id) DO NOTHING;

-- 4. Update existing doctors with slug
UPDATE public.doctor_profiles SET slug = LOWER(CONCAT(first_name, '-', last_name)) WHERE slug IS NULL;

-- 5. Create a new test doctor (Ravi Tomar) with full data
-- First ensure auth.users entry exists (we'll use a placeholder)
-- Note: In production, you'd create proper auth.users entries

-- Insert doctor profile for Ravi Tomar if not exists
INSERT INTO public.doctor_profiles (
  id,
  user_id,
  slug,
  title,
  first_name,
  last_name,
  specialization,
  sub_specialization,
  experience_years,
  about,
  qualifications,
  registration_no,
  clinic_name,
  hospital,
  address,
  city,
  state,
  zip,
  phone,
  email,
  languages,
  base_fee,
  availability,
  patients_served,
  rating,
  clinic_photo_urls,
  photo_url
)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000012',
  'ravi-tomar',
  'Dr.',
  'Ravi',
  'Tomar',
  'Internal Medicine',
  'General Medicine',
  8,
  'Experienced general physician with 8 years of practice. Specializes in preventive care and chronic disease management.',
  ARRAY['MBBS', 'MD (Internal Medicine)'],
  'MCI-2015-38472',
  'Tomar Medical Clinic',
  'Fortis Hospital',
  '456 Health Avenue, Sector 15, Noida',
  'Noida',
  'Uttar Pradesh',
  '201301',
  '+91 98765 12345',
  'ravi.tomar@example.com',
  ARRAY['English', 'Hindi'],
  500,
  'online',
  1200,
  4.7,
  ARRAY['/images/clinic-1.jpg', '/images/clinic-2.jpg'],
  '/images/doctor-avatar.jpg'
)
ON CONFLICT (user_id) DO UPDATE SET
  slug = EXCLUDED.slug,
  specialization = EXCLUDED.specialization,
  sub_specialization = EXCLUDED.sub_specialization;

-- 6. Add doctor services for Ravi Tomar
INSERT INTO public.doctor_services (doctor_id, service_id, fee, enabled)
VALUES 
  ('00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 500, true),
  ('00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000002', 200, true),
  ('00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000003', 1500, false),
  ('00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', 2000, true),
  ('00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000005', 3000, false),
  ('00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000006', 300, true),
  ('00000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000007', 100, true)
ON CONFLICT (doctor_id, service_id) DO UPDATE SET
  fee = EXCLUDED.fee,
  enabled = EXCLUDED.enabled;

-- 7. Add time slots for Ravi Tomar (Mon-Sat, 9AM-12PM, 2PM-6PM)
INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, appointment_duration, is_available)
VALUES 
  -- Monday (1)
  ('00000000-0000-0000-0000-000000000012', 1, '09:00:00', '12:00:00', 30, true),
  ('00000000-0000-0000-0000-000000000012', 1, '14:00:00', '18:00:00', 30, true),
  -- Tuesday (2)
  ('00000000-0000-0000-0000-000000000012', 2, '09:00:00', '12:00:00', 30, true),
  ('00000000-0000-0000-0000-000000000012', 2, '14:00:00', '18:00:00', 30, true),
  -- Wednesday (3)
  ('00000000-0000-0000-0000-000000000012', 3, '09:00:00', '12:00:00', 30, true),
  ('00000000-0000-0000-0000-000000000012', 3, '14:00:00', '18:00:00', 30, true),
  -- Thursday (4)
  ('00000000-0000-0000-0000-000000000012', 4, '09:00:00', '12:00:00', 30, true),
  ('00000000-0000-0000-0000-000000000012', 4, '14:00:00', '18:00:00', 30, true),
  -- Friday (5)
  ('00000000-0000-0000-0000-000000000012', 5, '09:00:00', '12:00:00', 30, true),
  ('00000000-0000-0000-0000-000000000012', 5, '14:00:00', '18:00:00', 30, true),
  -- Saturday (6)
  ('00000000-0000-0000-0000-000000000012', 6, '09:00:00', '13:00:00', 30, true)
ON CONFLICT DO NOTHING;

-- 8. Update existing doctors with proper slugs
UPDATE public.doctor_profiles SET slug = 'rahul-sharma' WHERE first_name ILIKE 'Rahul' AND last_name ILIKE 'Sharma';
UPDATE public.doctor_profiles SET slug = 'priya-patel' WHERE first_name ILIKE 'Priya' AND last_name ILIKE 'Patel';
UPDATE public.doctor_profiles SET slug = 'andrew-mitchell' WHERE first_name ILIKE 'Andrew' AND last_name ILIKE 'Mitchell';

-- 9. Ensure Priya Patel has doctor_services
INSERT INTO public.doctor_services (doctor_id, service_id, fee, enabled)
SELECT 
  dp.user_id,
  s.id,
  s.price,
  true
FROM public.doctor_profiles dp
CROSS JOIN public.services s
WHERE dp.slug = 'priya-patel'
ON CONFLICT (doctor_id, service_id) DO NOTHING;

-- 10. Ensure Rahul Sharma has doctor_services
INSERT INTO public.doctor_services (doctor_id, service_id, fee, enabled)
SELECT 
  dp.user_id,
  s.id,
  s.price,
  true
FROM public.doctor_profiles dp
CROSS JOIN public.services s
WHERE dp.slug = 'rahul-sharma'
ON CONFLICT (doctor_id, service_id) DO NOTHING;

-- 11. Add time slots for existing doctors if they don't have any
INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, appointment_duration, is_available)
SELECT 
  dp.user_id,
  d.day,
  '09:00:00',
  '12:00:00',
  30,
  true
FROM public.doctor_profiles dp
CROSS JOIN (VALUES (1), (2), (3), (4), (5), (6)) AS d(day)
WHERE dp.slug IN ('rahul-sharma', 'priya-patel')
AND NOT EXISTS (
  SELECT 1 FROM public.time_slots ts 
  WHERE ts.doctor_id = dp.user_id 
  AND ts.day_of_week = d.day
  AND ts.start_time = '09:00:00'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, appointment_duration, is_available)
SELECT 
  dp.user_id,
  d.day,
  '14:00:00',
  '18:00:00',
  30,
  true
FROM public.doctor_profiles dp
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS d(day)
WHERE dp.slug IN ('rahul-sharma', 'priya-patel')
AND NOT EXISTS (
  SELECT 1 FROM public.time_slots ts 
  WHERE ts.doctor_id = dp.user_id 
  AND ts.day_of_week = d.day
  AND ts.start_time = '14:00:00'
)
ON CONFLICT DO NOTHING;

-- 12. Verify the data
SELECT 
  'doctor_profiles' as table_name,
  COUNT(*) as count
FROM public.doctor_profiles
UNION ALL
SELECT 
  'doctor_services',
  COUNT(*) 
FROM public.doctor_services
UNION ALL
SELECT 
  'time_slots',
  COUNT(*) 
FROM public.time_slots
UNION ALL
SELECT 
  'services',
  COUNT(*) 
FROM public.services;
