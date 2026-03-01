-- ============================================================================
-- FIX APPOINTMENTS RLS POLICIES
-- ============================================================================

-- Drop all existing policies on appointments
DROP POLICY IF EXISTS "Users can see own appointments" ON public.appointments;

-- Policy 1: SELECT - Allow patients/doctors to see their own appointments
CREATE POLICY "Users can see own appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  -- Patient can see their own appointments
  (auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = appointments.patient_id))
  OR
  -- Doctor can see their own appointments
  (auth.uid() IN (SELECT user_id FROM public.doctor_profiles WHERE user_id = appointments.doctor_id))
);

-- Policy 2: INSERT - Allow patients to create appointments
-- (But not doctors, doctors manage their availability differently)
CREATE POLICY "Patients can insert appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only patients can insert appointments
  auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = appointments.patient_id)
);

-- Policy 3: UPDATE - Allow patients/doctors to update their own appointments
CREATE POLICY "Users can update own appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  -- Patient can update their own appointments
  (auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = appointments.patient_id))
  OR
  -- Doctor can update their own appointments
  (auth.uid() IN (SELECT user_id FROM public.doctor_profiles WHERE user_id = appointments.doctor_id))
)
WITH CHECK (
  -- Patient can update their own appointments
  (auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = appointments.patient_id))
  OR
  -- Doctor can update their own appointments
  (auth.uid() IN (SELECT user_id FROM public.doctor_profiles WHERE user_id = appointments.doctor_id))
);

-- Verify all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  substr(qual, 1, 100) as qual_preview,
  substr(with_check, 1, 100) as with_check_preview
FROM pg_policies
WHERE tablename IN ('appointments', 'patient_profiles')
ORDER BY tablename, policyname;
