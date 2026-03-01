import {
  findPatientByPhone,
  findPatientByUserId,
  createPatientProfile,
  updatePatientProfile,
  calculateAge,
} from '@/lib/supabase/patient'
import type { PatientProfile, PatientProfileInput } from '@/types'

// ============================================================================
// PATIENT SERVICE - HIGH-LEVEL PATIENT OPERATIONS
// ============================================================================

/**
 * Check if a patient exists by phone
 */
export async function patientExistsByPhone(phone: string): Promise<boolean> {
  const patient = await findPatientByPhone(phone)
  return patient !== null
}

/**
 * Get patient profile by user ID
 */
export async function getPatientProfile(userId: string): Promise<PatientProfile | null> {
  return findPatientByUserId(userId)
}

/**
 * Get patient profile by phone number
 */
export async function getPatientProfileByPhone(phone: string): Promise<PatientProfile | null> {
  return findPatientByPhone(phone)
}

/**
 * Register a new patient
 */
export async function registerPatient(profileData: PatientProfileInput): Promise<{
  success: boolean
  profile?: PatientProfile
  error?: string
}> {
  try {
    const profile = await createPatientProfile(profileData)

    if (!profile) {
      return { success: false, error: 'Failed to create patient profile' }
    }

    return { success: true, profile }
  } catch (error: any) {
    console.error('Error registering patient:', error)
    return { success: false, error: error?.message || 'Registration failed' }
  }
}

/**
 * Update patient profile
 */
export async function updatePatient(
  userId: string,
  updates: Partial<PatientProfileInput>
): Promise<{
  success: boolean
  profile?: PatientProfile
  error?: string
}> {
  try {
    const profile = await updatePatientProfile(userId, updates)

    if (!profile) {
      return { success: false, error: 'Failed to update patient profile' }
    }

    return { success: true, profile }
  } catch (error: any) {
    console.error('Error updating patient:', error)
    return { success: false, error: error?.message || 'Update failed' }
  }
}

/**
 * Get patient age from profile
 */
export function getPatientAge(profile: PatientProfile): number {
  return calculateAge(profile.date_of_birth)
}

/**
 * Format patient display name
 */
export function formatPatientName(profile: PatientProfile): string {
  return profile.name || 'Patient'
}
