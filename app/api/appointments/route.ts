import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { successResponse, errorResponse } from '@/lib/server/response'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const patientId = searchParams.get('patient_id')

    if (!patientId) {
      return errorResponse('patient_id query parameter required', 400)
    }

    const { data: appointmentsData, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        doctor:doctor_profiles!inner(id, user_id, first_name, last_name, photo_url, specialization, google_meet_link),
        conversation:conversations(id, type)
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true })

    if (appointmentsError) {
      console.error('[API Appointments] Database error:', appointmentsError)
      return errorResponse(appointmentsError.message, 500)
    }

    const { data: servicesData } = await supabaseAdmin
      .from('services')
      .select('id, name, icon, type')

    const serviceMap = new Map((servicesData || []).map(s => [s.id, s]))

    const appointments = (appointmentsData || []).map((apt: any) => {
      const service = serviceMap.get(apt.service_id)
      const service_name = service?.name || apt.service_name || 'Consultation'
      const service_icon = service?.icon || 'Video'
      const doctorName = apt.doctor ? `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name}` : 'Doctor'
      const doctor_photo_url = apt.doctor?.photo_url
      const google_meet_link = apt.doctor?.google_meet_link || null
      const conversation_id = apt.conversation?.[0]?.id || null

      console.log('[API] Mapping appointment:', apt.id, 'service_id:', apt.service_id, 'service_name:', service_name, 'date:', apt.appointment_date, 'status:', apt.status, 'conversation_id:', conversation_id)

      return {
        ...apt,
        service_name,
        service_icon,
        doctorName,
        doctor_photo_url,
        google_meet_link,
        conversation_id,
        appointment_date: apt.appointment_date ? new Date(apt.appointment_date) : null,
      }
    })

    console.log('[API] Total appointments returned:', appointments.length)

    if (status) {
      const filtered = appointments.filter((apt: any) => apt.status === status)
      return successResponse(filtered)
    }

    return successResponse(appointments)
  } catch (error: any) {
    console.error('[API Appointments] Error:', error)
    return errorResponse(error?.message || 'Internal server error', 500)
  }
}
