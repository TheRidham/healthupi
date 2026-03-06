import { supabase } from '@/lib/supabase'
import { formatPhoneForDB, validateIndianPhone } from '@/lib/utils/phone'
import type { PatientProfileInput } from '@/types'


// ============================================================================
// AUTH SERVICE - PHONE AUTHENTICATION WITH SUPABASE
// ============================================================================


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
    // clearOtp(formattedPhone)

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

    // Supabase session is automatically maintained after signup
    // No need to store in localStorage
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
  } catch (error) {
    console.error('Error logging out:', error)
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
