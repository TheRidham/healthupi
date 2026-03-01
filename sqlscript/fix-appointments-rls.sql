-- ============================================================================
-- FIX APPOINTMENTS RLS POLICY
-- ============================================================================

-- Drop existing policies for appointments
DROP POLICY IF EXISTS "Users can see own appointments" ON public.appointments;

-- Create proper RLS policy for appointments
CREATE POLICY "Users can see own appointments"
ON public.appointments
FOR SELECT
USING (
  -- Patient can see their own appointments
  (auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = appointments.patient_id))
  OR
  -- Doctor can see their own appointments
  (auth.uid() IN (SELECT user_id FROM public.doctor_profiles WHERE user_id = appointments.doctor_id))
);

-- Verify policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'appointments';
