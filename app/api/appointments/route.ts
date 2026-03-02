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

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        doctor:doctor_profiles!appointments_doctor_id_fkey(user_id, first_name, last_name, photo_url, specialization)
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true })

    if (error) {
      return errorResponse(error.message, 500)
    }

    // Fetch all services to match by service_id
    const { data: servicesData } = await supabaseAdmin
      .from('services')
      .select('id, name, icon, type')

    const serviceMap = new Map((servicesData || []).map(s => [s.id, s]))

    const appointments = (data || []).map(apt => {
      const service = serviceMap.get(apt.service_id)
      return {
        ...apt,
        service_name: service?.name || 'Consultation',
        service_icon: service?.icon || 'Video',
        doctorName: apt.doctor ? `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name}` : 'Doctor',
        appointment_date: apt.appointment_date ? new Date(apt.appointment_date) : null,
      }
    })

    if (status) {
      const filtered = appointments.filter(apt => apt.status === status)
      return successResponse(filtered)
    }

    return successResponse(appointments)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}
