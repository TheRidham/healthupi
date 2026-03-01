import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// GET: Fetch doctor's time slots for public profile
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    
    console.log('[API Doctor TimeSlots] Fetching slots for doctor:', doctorId)

    // First, get the doctor by slug or UUID
    const isUuid = doctorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    
    let query = supabaseAdmin
      .from('doctor_profiles')
      .select('user_id, slug, first_name, last_name')

    if (isUuid) {
      query = query.eq('user_id', doctorId)
    } else {
      query = query.eq('slug', doctorId.toLowerCase())
    }

    const { data: doctor, error: doctorError } = await query.single()

    if (doctorError || !doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Get only available time slots for this doctor
    const { data: timeSlots, error: slotsError } = await supabaseAdmin
      .from('time_slots')
      .select('*')
      .eq('doctor_id', doctor.user_id)
      .eq('is_available', true)
      .order('day_of_week')
      .order('start_time')

    if (slotsError) {
      console.error('[API Doctor TimeSlots] Error fetching slots:', slotsError)
      return NextResponse.json(
        { success: false, error: slotsError.message },
        { status: 500 }
      )
    }

    // Format slots for frontend
    const formattedSlots = (timeSlots || []).map((slot: any) => ({
      id: slot.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      appointment_duration: slot.appointment_duration,
      is_available: slot.is_available,
    }))

    // Group by day of week
    const groupedSlots: Record<string, typeof formattedSlots> = {}
    ;[0, 1, 2, 3, 4, 5, 6].forEach(day => {
      groupedSlots[day.toString()] = formattedSlots.filter(s => s.day_of_week === day)
    })

    return NextResponse.json({
      success: true,
      data: {
        doctor: {
          user_id: doctor.user_id,
          slug: doctor.slug,
          name: `${doctor.first_name} ${doctor.last_name}`,
        },
        timeSlots: formattedSlots,
        groupedSlots,
      },
    })
  } catch (error: any) {
    console.error('[API Doctor TimeSlots] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
