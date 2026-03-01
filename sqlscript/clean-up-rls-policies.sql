-- ============================================================================
-- CLEAN UP RLS POLICIES (REMOVE RECURSIVE POLICIES)
-- ============================================================================

-- Drop all policies that might have recursion
DROP POLICY IF EXISTS "Patients can view own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can view own profile or lookup by phone" ON public.patient_profiles;
DROP POLICY IF EXISTS "Service role bypass on patient_profiles" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can insert own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can edit own profile" ON public.patient_profiles;

-- Create simple, non-recursive policies

-- Policy 1: Patients can view their own profile (when authenticated)
CREATE POLICY "Patients can view own profile"
ON public.patient_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Patients can edit their own profile
CREATE POLICY "Patients can edit own profile"
ON public.patient_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Patients can insert their own profile
CREATE POLICY "Patients can insert own profile"
ON public.patient_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Note: Service role key automatically bypasses RLS
-- No special policy needed for service_role

-- Clean up appointments policies too
DROP POLICY IF EXISTS "Users can see own appointments" ON public.appointments;

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

-- Verify all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  substr(qual, 1, 80) as qual_preview,
  substr(with_check, 1, 80) as with_check_preview
FROM pg_policies
WHERE tablename IN ('patient_profiles', 'appointments');
