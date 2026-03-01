-- ============================================================================
-- INSTRUCTIONS: HOW TO UPDATE CLINIC PHOTO URLS
-- ============================================================================

-- This script provides sample SQL statements to update clinic_photo_urls.
-- Replace the placeholder URLs with your actual Supabase Storage URLs.

-- ========================================
-- STEP 1: Upload Photos to Supabase Storage
-- ========================================

-- 1. Go to: https://pknskugaqkwtfxmmkoqg.supabase.co/storage
-- 2. Navigate to the 'doctor-photos' bucket
-- 3. Create folders for each doctor using their user_id:
--    - 00000000-0000-0000-0000-000000000010/
--    - 00000000-0000-0000-0000-000000000011/
-- 4. Upload photos into a 'clinic/' subfolder for each doctor
--    - 00000000-0000-0000-0000-000000000010/clinic/
--    - 00000000-0000-0000-0000-000000000011/clinic/

-- ========================================
-- STEP 2: Get Public URLs
-- ========================================

-- After uploading, click on each image and copy the public URL.
-- The URL format will be:
-- https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/[user_id]/clinic/[filename]

-- ========================================
-- STEP 3: Update Database
-- ========================================

-- Replace the placeholder URLs below with your actual URLs and run this SQL:

-- Update Rahul Sharma's clinic photos (user_id: 00000000-0000-0000-0000-000000000010)
UPDATE public.doctor_profiles
SET clinic_photo_urls = ARRAY[
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/clinic/clinic-photo-1.jpg',
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/clinic/clinic-photo-2.jpg',
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/clinic/clinic-photo-3.jpg'
]
WHERE user_id = '00000000-0000-0000-0000-000000000010';

-- Update Priya Patel's clinic photos (user_id: 00000000-0000-0000-0000-000000000011)
UPDATE public.doctor_profiles
SET clinic_photo_urls = ARRAY[
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000011/clinic/skin-care-clinic-1.jpg',
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000011/clinic/skin-care-clinic-2.jpg'
]
WHERE user_id = '00000000-0000-0000-0000-000000000011';

-- ========================================
-- STEP 4: Verify Updates
-- ========================================

SELECT
  user_id,
  first_name,
  last_name,
  clinic_name,
  clinic_photo_urls,
  ARRAY_LENGTH(clinic_photo_urls) as photo_count
FROM public.doctor_profiles
WHERE user_id IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011');

-- ========================================
-- OPTIONAL: Clear Empty Arrays
-- ========================================

-- If a doctor has an empty array and you want to keep it empty:
-- UPDATE public.doctor_profiles
-- SET clinic_photo_urls = ARRAY[]::text[]
-- WHERE user_id = '00000000-0000-0000-0000-000000000010';