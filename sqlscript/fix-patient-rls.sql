-- ============================================================================
-- FIX PATIENT PROFILES RLS POLICY TO ALLOW SERVICE ROLE INSERTS
-- ============================================================================

-- Drop existing policies for patient_profiles (we'll recreate them)
DROP POLICY IF EXISTS "Patients can insert own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can edit own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can view own profile" ON public.patient_profiles;

-- Create new policies that allow service role for inserts

-- Policy 1: Patients can view their own profile
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

-- Policy 3: Patients (and service role) can insert profiles
-- This allows both:
-- - Users to insert their own profile (auth.uid() = user_id)
-- - Service role to insert profiles for new users (bypass RLS)
CREATE POLICY "Patients can insert own profile"
ON public.patient_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow service role to bypass RLS for inserts
-- This is needed because the service role has auth.uid() = null
CREATE POLICY "Service role can insert patient profiles"
ON public.patient_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if it's the same user (regular users)
  auth.uid() = user_id
  OR
  -- Allow if using service role (checked by role claim in JWT)
  (auth.jwt() ->> 'role')::text = 'service_role'
);

-- Note: The service role key bypasses RLS automatically in Supabase,
-- but we create this policy for clarity and to prevent future issues.

-- Grant necessary permissions
GRANT ALL ON public.patient_profiles TO authenticated;
GRANT ALL ON public.patient_profiles TO anon;
