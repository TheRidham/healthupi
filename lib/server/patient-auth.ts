import { supabaseAdmin } from './supabase-admin'

/**
 * Server-side admin functions for patient authentication
 * These require SUPABASE_SERVICE_ROLE_KEY and should ONLY be called from API routes
 */

/**
 * Given a phone number:
 *  1. Returns the existing profile if the user already exists
 *  2. Otherwise creates a Supabase auth user + a minimal patient_profiles row
 */
export async function findOrCreatePatientByPhone(phone: string): Promise<{ success: boolean; userId?: string; userExist?: boolean; profile?: any; error?: string }> {
  try {
    // 1. Check for existing profile
    const { data: existingProfile, error: lookupError } = await supabaseAdmin
      .from('patient_profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle()

    if (lookupError) {
      console.error('Profile lookup error:', lookupError)
      return { success: false, error: lookupError.message }
    }

    if (existingProfile) {
      return { success: true, userId: existingProfile.user_id, userExist: true, profile: existingProfile }
    }

    // 2. Create new auth user
    const userId = await findOrCreateAuthUser(phone)
    if (!userId) {
      return { success: false, error: 'Failed to create auth user' }
    }

    // 3. Insert minimal profile row
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('patient_profiles')
      .insert({
        user_id: userId,
        phone,
        name: '', // placeholder — collected in onboarding
      })
      .select()
      .single()

    if (insertError) {
      console.error('Profile insert error:', insertError)
      await supabaseAdmin.auth.admin.deleteUser(userId) // rollback
      return { success: false, error: insertError.message }
    }

    return { success: true, userId, userExist: false, profile: newProfile }
  } catch (err: any) {
    console.error('findOrCreatePatientByPhone error:', err)
    return { success: false, error: err?.message ?? 'Unexpected error' }
  }
}

/**
 * Finds an existing auth user by phone or creates a new one
 */
async function findOrCreateAuthUser(phone: string): Promise<string | null> {
  const { data: list } = await supabaseAdmin.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.phone === phone)
  if (existing) return existing.id

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    phone,
    phone_confirm: true,
  })

  if (error || !data.user?.id) {
    console.error('createUser error:', error)
    return null
  }

  return data.user.id
}

/**
 * Generates a real session token for the patient
 */
export async function generateSessionToken(
  userId: string,
  phone: string,
): Promise<{ accessToken: string; refreshToken: string } | { accessToken: null; refreshToken: null }> {
  const email = `${phone.replace(/\D/g, '')}@healthupi.temp`
  const password = `pass_${userId.slice(0, 8)}`

  // Update user email/password
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email,
    email_confirm: true,
    password,
  })

  if (updateError) {
    console.error('updateUserById error:', updateError.message)
    return { accessToken: null, refreshToken: null }
  }

  // Sign in to get session tokens
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    console.error('signInWithPassword error:', error)
    return { accessToken: null, refreshToken: null }
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  }
}
