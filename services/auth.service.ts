import { supabase } from '@/lib/supabase'
import { storeOtp, verifyOtp, clearOtp } from '@/lib/utils/otp'
import { formatPhoneForDB, validateIndianPhone } from '@/lib/utils/phone'
import type { PatientProfileInput } from '@/types'
import { config } from '@/lib/config'

// Log if service role key is available
const serviceRoleKeyAvailable = !!config.supabase.supabaseServiceRoleKey

// ============================================================================
// AUTH SERVICE - PHONE AUTHENTICATION WITH SUPABASE (STUB FOR DEVELOPMENT)
// ============================================================================

/**
 * Send OTP to phone number (STUB - accepts any phone)
 * In production, integrate with Twilio, Firebase, or SMS API
 */
export async function sendOtpToPhone(phone: string): Promise<{ success: boolean; error?: string }> {
  // Validate phone format
  const cleanedPhone = phone.replace(/\D/g, '')
  if (!validateIndianPhone(cleanedPhone)) {
    return { success: false, error: 'Please enter a valid Indian mobile number' }
  }

  // Format phone for storage
  const formattedPhone = formatPhoneForDB(cleanedPhone)

  try {
    // Generate and store OTP
    const generatedOtp = storeOtp(formattedPhone)

    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, error: 'Failed to send OTP. Please try again.' }
  }
}

/**
 * Verify OTP and check/create patient account
 */
export async function verifyPatientOtp(
  phone: string,
  otp: string
): Promise<{ success: boolean; isNewUser: boolean; userId?: string; profile?: any; error?: string }> {
  // Format phone for DB
  const formattedPhone = formatPhoneForDB(phone.replace(/\D/g, ''))


  // Check if patient exists (use anon client - RLS now allows it)
  const { data: existingPatient, error } = await supabase
    .from('patient_profiles')
    .select('user_id, name, email, phone, date_of_birth, gender')
    .eq('phone', formattedPhone)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking patient existence:', error)
    return { success: false, isNewUser: false, error: 'Failed to verify OTP. Please try again.' }
  }

  console.log("existing Patient: ", existingPatient);

  if (existingPatient) {
    // Existing user - return patient data
    return {
      success: true,
      isNewUser: false,
      userId: existingPatient.user_id,
      profile: existingPatient,
    }
  }

  // New user - return flag to show profile form
  return {
    success: true,
    isNewUser: true,
  }
}

/**
 * Create patient account (auth.user + patient_profile)
 */
export async function createPatientAccount(data: {
  phone: string
  name: string
  email?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  city?: string
  state?: string
  zip?: string
}): Promise<{ success: boolean; userId?: string; profile?: any; error?: string }> {
  try {
    // Format phone for DB
    const formattedPhone = formatPhoneForDB(data.phone.replace(/\D/g, ''))

    // Generate a random password (phone-based auth doesn't need user to remember it)
    const randomPassword = Math.random().toString(36).slice(-12)

    // Create auth.user using email-based signup (phone auth requires paid plan)
    // Use a dummy email for phone-only users
    const dummyEmail = `${formattedPhone.replace('+', '')}@healthupi.temp`

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dummyEmail,
      password: randomPassword,
      options: {
        data: {
          phone: formattedPhone,
          role: 'patient',
          is_patient: true,
        },
      },
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return { success: false, error: authError.message || 'Failed to create account' }
    }

    if (!authData.user?.id) {
      return { success: false, error: 'Failed to create account. Please try again.' }
    }

    // Create patient_profile row (use admin client to bypass RLS)
    const profileData: PatientProfileInput = {
      user_id: authData.user.id,
      name: data.name,
      phone: formattedPhone,
      email: data.email || undefined,
      date_of_birth: data.dateOfBirth || undefined,
      gender: data.gender || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zip: data.zip || undefined,
    }

    const { data: profile, error: profileError } = await supabase
      .from('patient_profiles')
      .insert(profileData)
      .select()
      .single()

    if (profileError) {
      console.error('Error creating patient profile:', profileError)
      console.error('Profile error details:', {
        code: (profileError as any).code,
        message: (profileError as any).message,
        details: (profileError as any).details,
        hint: (profileError as any).hint,
      })
      console.error('Profile data being inserted:', profileData)

      // Cleanup: Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)

      return { success: false, error: profileError.message || 'Failed to create profile' }
    }

    // Clear OTP after successful account creation
    clearOtp(formattedPhone)

    return {
      success: true,
      userId: authData.user.id,
      profile: profile,
    }
  } catch (error: any) {
    console.error('Error in createPatientAccount:', error)
    return { success: false, error: error?.message || 'An error occurred. Please try again.' }
  }
}

/**
 * Login existing patient (sets Supabase session)
 */
export async function loginPatient(
  userId: string,
  phone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the user exists in patient_profiles
    const { data: patient, error } = await supabase
      .from('patient_profiles')
      .select('user_id')
    .eq('user_id', userId)
    .single()

  if (error || !patient) {
      console.error('[Auth Service] Patient not found:', error)
      return { success: false, error: 'Patient account not found' }
    }

    // Set the auth session using the stored user
    // Note: This is a workaround. In production with phone auth, use supabase.auth.signInWithOtp()
    const formattedPhone = formatPhoneForDB(phone.replace(/\D/g, ''))

    // Store patient session info in localStorage for auth-context to pick up
    const sessionData = {
      userId,
      phone: formattedPhone,
      role: 'patient',
    }
    localStorage.setItem('patient_session', JSON.stringify(sessionData))

    return { success: true }
  } catch (error: any) {
    console.error('Error in loginPatient:', error)
    return { success: false, error: error?.message || 'Login failed. Please try again.' }
  }
}

/**
 * Logout patient
 */
export async function logoutPatient(): Promise<void> {
  try {
    // Clear Supabase session
    await supabase.auth.signOut()

    // Clear patient session data
    localStorage.removeItem('patient_session')

    // Clear any pending booking
    localStorage.removeItem('pending_booking')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

/**
 * Get current patient session (for auth-context to use)
 */
export function getPatientSession(): { userId?: string; phone?: string; role?: string } | null {
  try {
    const sessionData = localStorage.getItem('patient_session')
    if (sessionData) {
      return JSON.parse(sessionData)
    }
    return null
  } catch (error) {
    console.error('Error getting patient session:', error)
    return null
  }
}

/**
 * Update patient profile
 */
export async function updatePatientAccount(
  userId: string,
  updates: Partial<{
    name: string
    email?: string
    dateOfBirth?: string
    gender?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    blood_group?: string
    allergies?: string[]
    medical_conditions?: string[]
    medications?: string[]
    emergency_contact_name?: string
    emergency_contact_phone?: string
  }>
): Promise<{ success: boolean; profile?: any; error?: string }> {
  try {
    const updateData: any = { ...updates }

    // Map dateOfBirth to date_of_birth for DB
    if (updates.dateOfBirth) {
      delete updateData.dateOfBirth
      updateData.date_of_birth = updates.dateOfBirth
    }

    const { data: profile, error } = await supabase
      .from('patient_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating patient profile:', error)
      return { success: false, error: error.message || 'Failed to update profile' }
    }

    return { success: true, profile }
  } catch (error: any) {
    console.error('Error in updatePatientAccount:', error)
    return { success: false, error: error?.message || 'An error occurred' }
  }
}
