-- ============================================================================
-- INSTRUCTIONS: HOW TO UPDATE CLINIC PHOTO URLS
-- ============================================================================

-- ========================================
-- UPDATE CLINIC PHOTO URLS
-- ========================================

-- Step 1: Upload your clinic photos to Supabase Storage
-- Go to: https://pknskugaqkwtfxmmkoqg.supabase.co/storage
-- Navigate to 'doctor-photos' bucket (or create it)
-- Create folder structure like:
--   doctor-photos/
--     00000000-0000-0000-0000-000000000010/
--       avatar.jpg
--       clinic/
--         reception.jpg
--         treatment-room.jpg
--         equipment.jpg
--     00000000-0000-0000-0000-000000000011/
--       avatar.jpg
--       clinic/
--         front-view.jpg
--         consultation.jpg

-- Step 2: Get public URLs
-- After uploading, click on each image and copy the public URL
-- Format: https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/[path]

-- Step 3: Update doctor profiles with clinic photos
-- Replace the placeholder URLs below with your actual storage URLs

-- Update Rahul Sharma's clinic photos (user_id: 00000000-0000-0000-0000-000000000010)
UPDATE public.doctor_profiles
SET clinic_photo_urls = ARRAY[
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/clinic/clinic-1.jpg',
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/clinic/clinic-2.jpg',
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/clinic/clinic-3.jpg'
]
WHERE user_id = '00000000-0000-0000-0000-000000000010';

-- Update Priya Patel's clinic photos (user_id: 00000000-0000-0000-0000-000000000011)
UPDATE public.doctor_profiles
SET clinic_photo_urls = ARRAY[
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000011/clinic/clinic-1.jpg',
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000011/clinic/clinic-2.jpg'
]
WHERE user_id = '00000000-0000-0000-0000-000000000011';

-- ========================================
-- UPDATE AVATAR PHOTOS
-- ========================================

-- If you uploaded new avatar photos, update them too:

-- Update Rahul Sharma's avatar
UPDATE public.doctor_profiles
SET photo_url = 'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/avatar.jpg'
WHERE user_id = '00000000-0000-0000-0000-000000000010';

-- Update Priya Patel's avatar
UPDATE public.doctor_profiles
SET photo_url = 'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000011/avatar.jpg'
WHERE user_id = '00000000-0000-0000-0000-000000000011';

-- ========================================
-- VERIFY UPDATES
-- ========================================

-- Check updated values
SELECT
  user_id,
  first_name,
  last_name,
  photo_url as avatar,
  clinic_name,
  clinic_photo_urls,
  array_length(clinic_photo_urls, 1) as photo_count
FROM public.doctor_profiles
WHERE user_id IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011');