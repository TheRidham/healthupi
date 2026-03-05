-- Add google_meet_link column to doctor_profiles table
ALTER TABLE public.doctor_profiles
ADD COLUMN IF NOT EXISTS google_meet_link text;

-- Add comment to describe the column
COMMENT ON COLUMN public.doctor_profiles.google_meet_link IS 'Google Meet link for virtual consultations';
