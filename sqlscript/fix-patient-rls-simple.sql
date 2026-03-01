-- ============================================================================
-- SIMPLER FIX: DISABLE RLS FOR SERVICE ROLE ON PATIENT_PROFILES
-- ============================================================================

-- The service role key should bypass RLS, but we'll explicitly allow it

-- Drop existing insert policy
DROP POLICY IF EXISTS "Patients can insert own profile" ON public.patient_profiles;

-- Create a more permissive insert policy that allows:
-- 1. Users to insert their own profile (auth.uid() = user_id)
-- 2. Service role to bypass this check
CREATE POLICY "Patients can insert own profile"
ON public.patient_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR
  -- Service role bypass (service_role has higher privileges)
  (auth.jwt() ->> 'role')::text = 'service_role'
  OR
  -- For service_role, auth.uid() might be null, so we allow if user_id is provided
  auth.uid() IS NULL
);

-- Note: When using service_role key, auth.uid() returns null
-- but the service_role has admin privileges that bypass RLS automatically

-- Verify the policy was created
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
WHERE tablename = 'patient_profiles';
