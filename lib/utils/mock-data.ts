import { supabase } from '@/lib/supabase'

// ============================================================================
// MOCK DATA MAPPINGS FOR DEVELOPMENT
// ============================================================================

// Map mock service IDs to UUIDs (these will need to exist in DB)
export const SERVICE_UUID_MAP: Record<string, string> = {
  'video-call': '00000000-0000-0000-0000-000000000001',
  'chat': '00000000-0000-0000-0000-000000000002',
  'home-visit': '00000000-0000-0000-0000-000000000003',
  'emergency': '00000000-0000-0000-0000-000000000004',
  'subscription': '00000000-0000-0000-0000-000000000005',
  'followup': '00000000-0000-0000-0000-000000000006',
  'followup-video': '00000000-0000-0000-0000-000000000007',
  'followup-chat': '00000000-0000-0000-0000-000000000008',
}

// Map mock doctor slugs to actual doctor UUIDs
export const DOCTOR_UUID_MAP: Record<string, string> = {
  'rahul-sharma': '00000000-0000-0000-0000-000000000010',
  'priya-patel': '00000000-0000-0000-0000-000000000011',
}

export function getServiceUuid(serviceId: string): string {
  if (serviceId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return serviceId
  }

  return SERVICE_UUID_MAP[serviceId] || serviceId
}

export async function fetchServiceUuid(serviceId: string, doctorId: string): Promise<string | null> {
  try {
    if (serviceId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return serviceId
    }

    console.log('[Service Utils] Fetching service UUID for id:', serviceId, 'doctor:', doctorId)

    const { data, error } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .single()

    if (data?.id) {
      console.log('[Service Utils] Found service by id:', data.id)
      return data.id
    }

    console.warn('[Service Utils] Service not found in DB, using mock UUID map')
    return getServiceUuid(serviceId)
  } catch (error) {
    console.error('[Service Utils] Error in fetchServiceUuid:', error)
    return getServiceUuid(serviceId)
  }
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  console.log('[Mock Data] calculateEndTime called with:', { startTime, durationMinutes })

  const ampmMatch = startTime.match(/(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i)

  let parsedHrs = 0
  let parsedMins = 0

  if (ampmMatch) {
    parsedHrs = parseInt(ampmMatch[1])
    parsedMins = parseInt(ampmMatch[2])
  }

  const meridiem = startTime.toUpperCase().includes('PM') ? 'PM' : 'AM'
  let endHrs = parsedHrs
  if (meridiem === 'PM' && endHrs !== 12) {
    endHrs += 12
  } else if (meridiem === 'AM' && endHrs === 12) {
    endHrs = 0
  }

  const totalMins = endHrs * 60 + parsedMins + durationMinutes
  const finalHrs = Math.floor(totalMins / 60) % 24
  const finalMins = totalMins % 60

  const result = `${finalHrs.toString().padStart(2, '0')}:${finalMins.toString().padStart(2, '0')}`
  console.log('[Mock Data] Calculated end time:', result)
  return result
}
