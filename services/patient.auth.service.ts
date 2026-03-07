import { supabaseClient } from "@/lib/supabase-client"

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

    const { data, error } = await supabaseClient
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