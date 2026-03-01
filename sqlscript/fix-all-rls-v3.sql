-- ============================================================================
-- FIX ALL RLS POLICIES FOR PATIENT BOOKING FLOW
-- ============================================================================

-- ============================================================
-- 1. PATIENT PROFILES
-- ============================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Patients can view own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can edit own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can insert own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Allow phone lookups for login" ON public.patient_profiles;

-- Policy: Patients can view their own profile
CREATE POLICY "Patients can view own profile"
ON public.patient_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Patients can edit their own profile
CREATE POLICY "Patients can edit own profile"
ON public.patient_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Patients can insert their own profile
CREATE POLICY "Patients can insert own profile"
ON public.patient_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow anon users to query by phone (needed for login lookup)
CREATE POLICY "Allow phone lookups for login"
ON public.patient_profiles
FOR SELECT
TO anon
USING (true);

-- ============================================================
-- 2. APPOINTMENTS
-- ============================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can see own appointments" ON public.appointments;

-- Policy: Patients/doctors can see their own appointments
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

-- Policy: Patients can insert appointments
CREATE POLICY "Patients can insert appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only patients can insert appointments
  auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = appointments.patient_id)
);

-- Policy: Users can update their own appointments
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

-- ============================================================
-- 3. PAYMENTS
-- ============================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can see own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert payments" ON public.payments;

-- Policy: Users can see their own payments
CREATE POLICY "Users can see own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
  -- Patient can see their own payments
  (auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = payments.patient_id))
  OR
  -- Doctor can see their own payments
  (auth.uid() IN (SELECT user_id FROM public.doctor_profiles WHERE user_id = payments.doctor_id))
);

-- Policy: Users can insert payments (needed for booking)
CREATE POLICY "Users can insert payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only patients can insert payments
  auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = payments.patient_id))
);

-- ============================================================
-- VERIFY ALL POLICIES
-- ============================================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  substr(qual, 1, 100) as qual_preview,
  substr(with_check, 1, 100) as with_check_preview
FROM pg_policies
WHERE tablename IN ('patient_profiles', 'appointments', 'payments')
ORDER BY tablename, policyname;
