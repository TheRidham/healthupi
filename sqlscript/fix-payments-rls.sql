-- ============================================================================
-- FIX PAYMENTS RLS POLICIES
-- ============================================================================

-- Policy 1: Allow users to see their own payments
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

-- Policy 2: Allow patients to create payments (needed for booking)
CREATE POLICY "Users can insert payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only patients can insert payments
  auth.uid() IN (SELECT user_id FROM public.patient_profiles WHERE user_id = payments.patient_id)
);

-- Verify policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('payments', 'appointments', 'patient_profiles')
ORDER BY tablename, policyname;
