import { supabaseAdmin } from './supabase-admin'

export interface DoctorProfile {
  user_id: string
  first_name: string
  last_name: string
  email?: string
}

export async function findDoctor(doctorIdOrSlug: string): Promise<DoctorProfile | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctorIdOrSlug)

  if (isUuid) {
    const result = await supabaseAdmin
      .from('doctor_profiles')
      .select('user_id, first_name, last_name, email')
      .eq('user_id', doctorIdOrSlug)
      .single()
    return result.data
  }

  const parts = doctorIdOrSlug.split('-')
  if (parts.length >= 2) {
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')

    const result = await supabaseAdmin
      .from('doctor_profiles')
      .select('user_id, first_name, last_name, email')
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)
      .limit(1)
      .single()
    return result.data
  }

  return null
}

export async function getDoctorByUserId(userId: string): Promise<DoctorProfile | null> {
  const result = await supabaseAdmin
    .from('doctor_profiles')
    .select('user_id, first_name, last_name, email')
    .eq('user_id', userId)
    .single()
  return result.data
}
