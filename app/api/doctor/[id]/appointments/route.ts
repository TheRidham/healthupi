import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { findDoctor } from '@/lib/server/doctor'
import { requireDoctor, handleAuthError } from '@/lib/server/auth'
import { successResponse, errorResponse } from '@/lib/server/response'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Appointments API] GET request starting...')
    const authUser = await requireDoctor(request)
    console.log('[Appointments API] Auth passed, user:', authUser.id)
    
    const { id: doctorId } = await context.params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    console.log('[Appointments API] doctorId:', doctorId, 'status:', status, 'date:', date)

    const doctor = await findDoctor(doctorId)
    if (!doctor) {
      console.error('[Appointments API] Doctor not found:', doctorId)
      return errorResponse('Doctor not found', 404)
    }

    if (doctor.user_id !== authUser.id) {
      console.error('[Appointments API] Auth mismatch - doctor user_id:', doctor.user_id, 'auth id:', authUser.id)
      return errorResponse('Cannot view another doctor\'s appointments', 403)
    }

    console.log('[Appointments API] Fetching appointments for doctor:', doctor.user_id)

    let appointmentsQuery = supabaseAdmin
      .from('appointments')
      .select(`
        *,
        patient:patient_profiles!appointments_patient_id_fkey(
          user_id,
          name,
          photo_url,
          phone,
          email,
          date_of_birth
        ),
        conversation:conversations(id, type)
      `)
      .eq('doctor_id', doctor.user_id)

    if (status) {
      appointmentsQuery = appointmentsQuery.eq('status', status)
    }
    if (date) {
      appointmentsQuery = appointmentsQuery.eq('appointment_date', date)
    }

    const { data: appointments, error } = await appointmentsQuery
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('[Appointments API] Query error:', error)
      return errorResponse(error.message, 500)
    }

    console.log('[Appointments API] Found appointments:', appointments?.length || 0)

    // Fetch all services to match by service_id
    const { data: servicesData } = await supabaseAdmin
      .from('services')
      .select('id, name, icon, type')

    const serviceMap = new Map((servicesData || []).map(s => [s.id, s]))

    const formattedAppointments = (appointments || []).map((apt: any) => {
      const service = serviceMap.get(apt.service_id)
      return {
        id: apt.id,
        patient_id: apt.patient_id,
        patient_name: apt.patient?.name || 'Unknown',
        patient_photo: apt.patient?.photo_url || '/images/user-avatar.jpg',
        service_id: apt.service_id,
        service_name: service?.name || 'Consultation',
        service_icon: service?.icon || 'Video',
        service_type: service?.type || 'service',
        appointment_date: apt.appointment_date,
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status,
        booked_fee: apt.booked_fee,
        notes: apt.notes,
        conversation_id: apt.conversation?.[0]?.id || null,
      }
    })

    const today = new Date().toISOString().split('T')[0]
    const upcoming = formattedAppointments.filter((apt: any) =>
      apt.appointment_date >= today && ['pending', 'confirmed'].includes(apt.status)
    )
    const completed = formattedAppointments.filter((apt: any) => apt.status === 'completed')
    const todayAppointments = formattedAppointments.filter((apt: any) => apt.appointment_date === today)

    console.log('[Appointments API] Returning:', { today: todayAppointments.length, upcoming: upcoming.length, completed: completed.length })

    return successResponse({
      all: formattedAppointments,
      upcoming,
      completed,
      today: todayAppointments,
      stats: {
        todayCount: todayAppointments.length,
        upcomingCount: upcoming.length,
        completedCount: completed.length,
      }
    })
  } catch (error) {
    console.error('[Appointments API] Exception:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}
