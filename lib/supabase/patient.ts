import { supabase } from '../supabase'
import type { PatientProfile, PatientProfileInput } from '@/types'

// ============================================================================
// PATIENT PROFILE CRUD OPERATIONS
// ============================================================================

/**
 * Find patient by phone number (uses anon client with updated RLS)
 */
export async function findPatientByPhone(phone: string): Promise<PatientProfile | null> {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - patient doesn't exist
        return null
      }
      console.error('Error finding patient by phone:', error)
      return null
    }

    // Convert date_of_birth string to Date if it exists
    if (data?.date_of_birth) {
      data.date_of_birth = new Date(data.date_of_birth)
    }

    return data
  } catch (error) {
    console.error('Error in findPatientByPhone:', error)
    return null
  }
}

/**
 * Find patient by user_id
 */
export async function findPatientByUserId(userId: string): Promise<PatientProfile | null> {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error finding patient by userId:', error)
      return null
    }

    // Convert date_of_birth string to Date if it exists
    if (data?.date_of_birth) {
      data.date_of_birth = new Date(data.date_of_birth)
    }

    return data
  } catch (error) {
    console.error('Error in findPatientByUserId:', error)
    return null
  }
}

/**
 * Create a new patient profile
 */
export async function createPatientProfile(profile: PatientProfileInput): Promise<PatientProfile | null> {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) {
      console.error('Error creating patient profile:', error)
      return null
    }

    // Convert date_of_birth string to Date if it exists
    if (data?.date_of_birth) {
      data.date_of_birth = new Date(data.date_of_birth)
    }

    return data
  } catch (error) {
    console.error('Error in createPatientProfile:', error)
    return null
  }
}

/**
 * Update patient profile
 */
export async function updatePatientProfile(
  userId: string,
  updates: Partial<PatientProfileInput>
): Promise<PatientProfile | null> {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating patient profile:', error)
      return null
    }

    // Convert date_of_birth string to Date if it exists
    if (data?.date_of_birth) {
      data.date_of_birth = new Date(data.date_of_birth)
    }

    return data
  } catch (error) {
    console.error('Error in updatePatientProfile:', error)
    return null
  }
}

/**
 * Delete patient profile (soft delete via CASCADE in DB)
 */
export async function deletePatientProfile(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patient_profiles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting patient profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deletePatientProfile:', error)
    return false
  }
}

/**
 * Get patient age from date_of_birth
 */
export function calculateAge(dateOfBirth: Date | null | undefined): number {
  if (!dateOfBirth) return 0

  const today = new Date()
  const birthDate = new Date(dateOfBirth)

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}
