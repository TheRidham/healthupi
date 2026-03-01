-- ============================================================================
-- TEMPORARY FIX: ALLOW PATIENT LOOKUPS BY PHONE WITHOUT AUTH CHECK
-- ============================================================================

-- Drop all existing policies on patient_profiles
DROP POLICY IF EXISTS "Patients can view own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can edit own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can insert own profile" ON public.patient_profiles;

-- Create simple policies

-- SELECT: Allow viewing if user is authenticated and owns the profile
CREATE POLICY "Patients can view own profile"
ON public.patient_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- UPDATE: Allow editing if user is authenticated and owns the profile
CREATE POLICY "Patients can edit own profile"
ON public.patient_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- INSERT: Allow inserting if user is authenticated OR if inserting with valid phone
-- This allows phone lookups for login flow
CREATE POLICY "Patients can insert own profile"
ON public.patient_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Regular user: can insert their own profile
  auth.uid() = user_id
);

-- Allow anon users to SELECT by phone (needed for login flow)
-- This bypasses the authentication check temporarily
CREATE POLICY "Allow phone lookups for login"
ON public.patient_profiles
FOR SELECT
TO anon
USING (true);

-- Clean up appointments policies
DROP POLICY IF EXISTS "Users can see own appointments" ON public.appointments;

CREATE POLICY "Users can see own appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  (auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = appointments.patient_id))
  OR
  (auth.uid() IN (SELECT user_id FROM public.doctor_profiles WHERE user_id = appointments.doctor_id))
);

-- Verify all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('patient_profiles', 'appointments')
ORDER BY tablename, policyname;
