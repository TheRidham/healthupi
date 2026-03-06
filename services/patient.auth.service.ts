import { supabaseAdmin } from "@/lib/supabaseAdmin"

// ─── Types ────────────────────────────────────────────────────────────────────

// table -> patient_profiles types
export interface PatientProfile {
  id: string
  user_id: string
  photo_url?: string | null
  name: string
  date_of_birth?: string | null      // ISO date string, e.g. "1990-01-15"
  gender?: string | null
  blood_group?: string | null
  allergies?: string[]
  phone?: string | null
  email?: string | null
  medical_conditions?: string[]
  medications?: string[]
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  created_at?: string
  updated_at?: string
}

/** Fields available during onboarding — all optional except those collected per step */
export interface PatientProfileUpdate {
  name?: string
  photo_url?: string
  date_of_birth?: string
  gender?: string
  blood_group?: string
  allergies?: string[]
  email?: string
  medical_conditions?: string[]
  medications?: string[]
  emergency_contact_name?: string
  emergency_contact_phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

export interface AuthResult {
  success: boolean
  userId?: string
  userExist?: boolean
  profile?: PatientProfile | null
  error?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPhoneForDB(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits.startsWith('+') ? digits : `+${digits}`
}

export function syntheticEmailFromPhone(phone: string): string {
  return `${phone.replace('+', '')}@phone.healthupi.local`
}

// Stable password derived from userId — never changes, never exposed to user
function syntheticPassword(userId: string): string {
  return `pat_${userId.replace(/-/g, '')}_hup`
}

// ─── Core: find-or-create auth user + patient_profiles row ───────────────────

/**
 * Given a verified E.164 phone number:
 *  1. Returns the existing profile if the user already exists
 *  2. Otherwise creates a Supabase auth user + a minimal patient_profiles row
 *
 * NOTE: `name` is NOT NULL in the schema. We insert a placeholder here
 * so the row is valid. It must be replaced during onboarding.
 * Alternatively, ALTER the column to allow NULLs:
 *   ALTER TABLE public.patient_profiles ALTER COLUMN name DROP NOT NULL;
 */
export async function findOrCreatePatientByPhone(phone: string): Promise<AuthResult> {
  try {
    // 1. Existing profile?
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

    console.log("phone: ", phone);

    // 2. New user — find or create auth user
    const userId = await findOrCreateAuthUser(phone)
    if (!userId) {
      return { success: false, error: 'Failed to create auth user' }
    }

    // 3. Insert minimal profile row
    //    • name: '' is a valid placeholder — replace with real name in onboarding step 1
    //    • allergies / medical_conditions / medications default to [] per schema
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('patient_profiles')
      .insert({
        user_id: userId,
        phone,
        name: '',   // placeholder — collected in onboarding step 1
      })
      .select()
      .single()

    if (insertError) {
      console.error('Profile insert error:', insertError)
      await supabaseAdmin.auth.admin.deleteUser(userId) // rollback orphaned auth user
      return { success: false, error: insertError.message }
    }

    return { success: true, userId, userExist: false, profile: newProfile }
  } catch (err: any) {
    console.error('findOrCreatePatientByPhone error:', err)
    return { success: false, error: err?.message ?? 'Unexpected error' }
  }
}

/**
 * Finds an existing Supabase auth user by phone or creates a new one.
 * Returns the user UUID, or null on failure.
 *
 * ⚠️  listUsers() is O(n). For large user bases, replace with:
 *   supabaseAdmin.rpc('get_user_id_by_phone', { phone })
 *   backed by a Postgres function querying auth.users directly.
 */
async function findOrCreateAuthUser(phone: string): Promise<string | null> {
  const { data: list } = await supabaseAdmin.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.phone === phone)
  console.log("exisiting auth: ", existing);
  if (existing) return existing.id

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    phone,
    phone_confirm: true,
  })

  console.log("auth data: ", data);

  if (error || !data.user?.id) {
    console.error('createUser error:', error)
    return null
  }

  return data.user.id
}

// ─── Core: generate a Supabase session token ──────────────────────────────────


/**
 * Returns a real access_token + refresh_token for the user.
 *
 * Strategy:
 *  1. Ensure the auth user has a synthetic email + known password (idempotent)
 *  2. Sign in with that email/password to get a real session
 *
 * This avoids createSession (requires supabase-js >= 2.39) and
 * generateLink (hashed_token expires in seconds).
 */
export async function generateSessionToken(
  userId: string,
  phone: string,
): Promise<{ accessToken: string; refreshToken: string } | { accessToken: null; refreshToken: null }> {
  const email = syntheticEmailFromPhone(phone)
  const password = syntheticPassword(userId)

  // Ensure the user has email + password set (safe to call every time)
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email,
    email_confirm: true,
    password,
  })

  if (updateError) {
    console.error('[patient-auth] updateUserById error:', updateError.message)
    return { accessToken: null, refreshToken: null }
  }

  // Sign in to get a real session with proper access + refresh tokens
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    console.error('[patient-auth] signInWithPassword error:', error?.message)
    return { accessToken: null, refreshToken: null }
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  }
}

// ─── Onboarding: update profile fields after auth ────────────────────────────

/**
 * Called from onboarding steps to progressively fill in profile fields.
 * Safe to call multiple times — only updates fields that are explicitly provided.
 *
 * @param userId  - the auth user's UUID (from session)
 * @param updates - partial profile fields to update
 */
export async function upsertPatientProfile(
  userId: string,
  updates: PatientProfileUpdate,
): Promise<{ success: boolean; profile?: PatientProfile; error?: string }> {
  try {
    // Build update payload — only include defined fields so we never
    // accidentally overwrite existing data with undefined
    const payload: Partial<Record<string, unknown>> = {}

    if (updates.name                    !== undefined) payload.name                     = updates.name
    if (updates.photo_url               !== undefined) payload.photo_url                = updates.photo_url
    if (updates.date_of_birth           !== undefined) payload.date_of_birth            = updates.date_of_birth
    if (updates.gender                  !== undefined) payload.gender                   = updates.gender
    if (updates.blood_group             !== undefined) payload.blood_group              = updates.blood_group
    if (updates.allergies               !== undefined) payload.allergies                = updates.allergies
    if (updates.email                   !== undefined) payload.email                    = updates.email
    if (updates.medical_conditions      !== undefined) payload.medical_conditions       = updates.medical_conditions
    if (updates.medications             !== undefined) payload.medications              = updates.medications
    if (updates.emergency_contact_name  !== undefined) payload.emergency_contact_name   = updates.emergency_contact_name
    if (updates.emergency_contact_phone !== undefined) payload.emergency_contact_phone  = updates.emergency_contact_phone
    if (updates.address                 !== undefined) payload.address                  = updates.address
    if (updates.city                    !== undefined) payload.city                     = updates.city
    if (updates.state                   !== undefined) payload.state                    = updates.state
    if (updates.zip                     !== undefined) payload.zip                      = updates.zip

    if (Object.keys(payload).length === 0) {
      return { success: false, error: 'No fields provided to update' }
    }

    const { data, error } = await supabaseAdmin
      .from('patient_profiles')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('upsertPatientProfile error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, profile: data }
  } catch (err: any) {
    console.error('upsertPatientProfile unexpected error:', err)
    return { success: false, error: err?.message ?? 'Unexpected error' }
  }
}