-- ============================================================================
-- FIX ALL RLS POLICIES
-- ============================================================================

-- Fix patient_profiles SELECT policy
DROP POLICY IF EXISTS "Patients can view own profile" ON public.patient_profiles;
CREATE POLICY "Patients can view own profile"
ON public.patient_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix appointments SELECT policy
DROP POLICY IF EXISTS "Users can see own appointments" ON public.appointments;
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

-- Fix patient_profiles INSERT policy
DROP POLICY IF EXISTS "Patients can insert own profile" ON public.patient_profiles;
CREATE POLICY "Patients can insert own profile"
ON public.patient_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR
  -- Allow service role to bypass (auth.uid() will be null for service_role)
  auth.uid() IS NULL
);

-- Verify all policies
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
WHERE tablename IN ('patient_profiles', 'appointments');
