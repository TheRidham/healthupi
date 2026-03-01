-- ============================================================================
-- HOW TO UPDATE CLINIC_PHOTO_URLS WITH STORAGE LINKS
-- ============================================================================

-- Step 1: Upload your clinic photos to Supabase Storage
-- Go to: https://supnskugaqkwtfxmmkoqg.supabase.co/storage
-- Navigate to the 'doctor-photos' bucket (or create it)
-- Create a folder structure like:
--   doctor-photos/
--     281e38c8-0aec-453a-b475-0d252050e47d/
--       avatar.jpg
--       clinic/
--         0.png
--         1.jpg
--     00000000-0000-0000-0000-000000000010/
--       avatar.jpg
--       clinic/
--         reception.jpg
--         treatment-room.jpg

-- Step 2: Get the public URLs
-- After uploading, get the public URL for each image
-- Format: https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/[path]

-- Step 3: Update doctor profiles with clinic photos
-- Replace the example URLs below with your actual storage URLs

-- Example: Update Rahul Sharma's clinic photos
UPDATE public.doctor_profiles
SET clinic_photo_urls = ARRAY[
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/clinic/clinic-1.jpg',
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/clinic/clinic-2.jpg',
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000010/clinic/clinic-3.jpg'
]
WHERE user_id = '00000000-0000-0000-0000-000000000010';

-- Example: Update Priya Patel's clinic photos
UPDATE public.doctor_profiles
SET clinic_photo_urls = ARRAY[
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000011/clinic/clinic-3.jpg',
  'https://pknskugaqkwtfxmmkoqg.supabase.co/storage/v1/object/public/doctor-photos/00000000-0000-0000-0000-000000000011/clinic/clinic-2.jpg'
]
WHERE user_id = '00000000-0000-0000-0000-000000000011';

-- Verify the updates
SELECT 
  user_id,
  first_name,
  last_name,
  clinic_name,
  photo_url as avatar,
  clinic_photo_urls
FROM public.doctor_profiles
WHERE user_id IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011');