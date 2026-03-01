import { supabase } from '@/lib/supabase'

// ============================================================================
// DOCTOR UTILITIES - MOCK DOCTOR UUID MAPPING
// ============================================================================

// For now, map mock doctor slugs to dummy UUIDs
// In production, this would be fetched from doctor_profiles table
export const DOCTOR_UUID_MAP: Record<string, string> = {
  'rahul-sharma': '00000000-0000-0000-0000-000000000010',
  'priya-patel': '00000000-0000-0000-0000-000000000011',
  'vinit-mitchel': '281e38c8-0aec-453a-b475-0d252050e47d',
  'rid-kha': '5e45edb8-e11b-48db-ad8a-838f73fcdc36',
  'ravi-tomar': '0c005620-bb41-4913-ba2f-c9f3b00b03fc',
}

/**
 * Convert doctor slug to UUID
 * In production, fetch from doctor_profiles: SELECT user_id FROM doctor_profiles WHERE id = slug
 */
export function getDoctorUuid(doctorIdOrSlug: string): string {
  // If already a UUID, return it
  if (doctorIdOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return doctorIdOrSlug
  }

  // Otherwise, use the map (for mock data)
  return DOCTOR_UUID_MAP[doctorIdOrSlug] || doctorIdOrSlug
}

/**
 * Fetch doctor UUID from database
 */
export async function fetchDoctorUuid(doctorIdOrSlug: string): Promise<string | null> {
  try {
    // If already a UUID, return it
    if (doctorIdOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return doctorIdOrSlug
    }

    console.log('[Doctor Utils] Fetching doctor UUID for slug:', doctorIdOrSlug)

    // First, try by user_id
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('user_id')
      .eq('user_id', doctorIdOrSlug)
      .single()

    if (!error && data?.user_id) {
      console.log('[Doctor Utils] Found doctor by user_id:', data.user_id)
      return data.user_id
    }

    // Try to find by first_name + last_name combination
    const parts = doctorIdOrSlug.split('-')
    if (parts.length >= 2) {
      const firstName = parts[0]
      const lastName = parts.slice(1).join(' ')
      
      const { data: data3 } = await supabase
        .from('doctor_profiles')
        .select('user_id')
        .ilike('first_name', firstName)
        .ilike('last_name', lastName)
        .limit(1)
        .single()

      if (data3?.user_id) {
        console.log('[Doctor Utils] Found doctor by name:', data3.user_id)
        return data3.user_id
      }
    }

    // Try to find by first_name alone (for backwards compatibility)
    const { data: data4 } = await supabase
      .from('doctor_profiles')
      .select('user_id')
      .ilike('first_name', doctorIdOrSlug.replace(/-/g, ' '))
      .limit(1)
      .single()

    if (data4?.user_id) {
      console.log('[Doctor Utils] Found doctor by first_name:', data4.user_id)
      return data4.user_id
    }

    // Fall back to map for mock data
    console.warn('[Doctor Utils] Doctor not found in DB, using mock UUID map')
    return getDoctorUuid(doctorIdOrSlug)
  } catch (error) {
    console.error('[Doctor Utils] Error in fetchDoctorUuid:', error)
    return getDoctorUuid(doctorIdOrSlug)
  }
}
