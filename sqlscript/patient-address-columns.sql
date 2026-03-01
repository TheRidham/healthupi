-- Add address columns to patient_profiles
-- This allows patients to save their address for bookings

ALTER TABLE public.patient_profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS zip VARCHAR(20);

-- Add index for phone lookup (faster authentication queries)
CREATE INDEX IF NOT EXISTS idx_patient_profiles_phone
ON public.patient_profiles(phone);

-- Add index for email lookup
CREATE INDEX IF NOT EXISTS idx_patient_profiles_email
ON public.patient_profiles(email);

-- Comment: These indexes optimize authentication queries by phone/email
