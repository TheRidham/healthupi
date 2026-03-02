import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { successResponse, errorResponse } from '@/lib/server/response'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctorId)

    let doctorQuery = supabaseAdmin
      .from('doctor_profiles')
      .select('user_id, first_name, last_name')

    if (isUuid) {
      doctorQuery = doctorQuery.eq('user_id', doctorId)
    } else {
      const parts = doctorId.split('-')
      if (parts.length >= 2) {
        const firstName = parts[0]
        const lastName = parts.slice(1).join(' ')
        doctorQuery = doctorQuery
          .ilike('first_name', firstName)
          .ilike('last_name', lastName)
          .limit(1)
      } else {
        return errorResponse('Invalid doctor identifier', 400)
      }
    }

    const { data: doctor, error: doctorError } = await doctorQuery.single()

    if (doctorError || !doctor) {
      return errorResponse('Doctor not found', 404)
    }

    const { data: timeSlots, error: slotsError } = await supabaseAdmin
      .from('time_slots')
      .select('*')
      .eq('doctor_id', doctor.user_id)
      .eq('is_available', true)
      .order('day_of_week')
      .order('start_time')

    if (slotsError) {
      return errorResponse(slotsError.message, 500)
    }

    let appointments: any[] = []
    if (date) {
      const { data: appointmentsData, error: aptError } = await supabaseAdmin
        .from('appointments')
        .select('start_time, end_time, appointment_date')
        .eq('doctor_id', doctor.user_id)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed'])

      if (!aptError && appointmentsData) {
        appointments = appointmentsData
      }
    }

    const formattedSlots = (timeSlots || []).map((slot: any) => ({
      id: slot.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      appointment_duration: slot.appointment_duration,
      is_available: slot.is_available,
    }))

    const groupedSlots: Record<string, typeof formattedSlots> = {}
    ;[0, 1, 2, 3, 4, 5, 6].forEach(day => {
      groupedSlots[day.toString()] = formattedSlots.filter(s => s.day_of_week === day)
    })

    return successResponse({
      doctor: {
        user_id: doctor.user_id,
        name: `${doctor.first_name} ${doctor.last_name}`,
      },
      timeSlots: formattedSlots,
      groupedSlots,
      appointments: appointments || [],
    })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}
