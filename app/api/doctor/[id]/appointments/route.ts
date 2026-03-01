import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

async function findDoctor(doctorIdOrSlug: string): Promise<any> {
  const isUuid = doctorIdOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  
  if (isUuid) {
    const result = await supabaseAdmin
      .from('doctor_profiles')
      .select('user_id, first_name, last_name')
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
      .select('user_id, first_name, last_name')
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)
      .limit(1)
      .single()
    return result.data
  }
  return null
}

// GET: Fetch doctor's appointments
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    
    console.log('[API Doctor Appointments] Fetching appointments for doctor:', doctorId)

    const doctor = await findDoctor(doctorId)
    if (!doctor) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 })
    }

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
        doctor:doctor_profiles!appointments_doctor_id_fkey(
          first_name,
          last_name
        )
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
      console.error('[API Doctor Appointments] Error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Format appointments
    const formattedAppointments = (appointments || []).map((apt: any) => ({
      id: apt.id,
      patient_id: apt.patient_id,
      patient_name: apt.patient?.name || 'Unknown',
      patient_photo: apt.patient?.photo_url || '/images/user-avatar.jpg',
      service_type: apt.service_id,
      appointment_date: apt.appointment_date,
      start_time: apt.start_time,
      end_time: apt.end_time,
      status: apt.status,
      booked_fee: apt.booked_fee,
      notes: apt.notes,
    }))

    // Separate by status
    const today = new Date().toISOString().split('T')[0]
    const upcoming = formattedAppointments.filter((apt: any) => 
      apt.appointment_date >= today && ['pending', 'confirmed'].includes(apt.status)
    )
    const completed = formattedAppointments.filter((apt: any) => apt.status === 'completed')
    const todayAppointments = formattedAppointments.filter((apt: any) => apt.appointment_date === today)

    return NextResponse.json({
      success: true,
      data: {
        all: formattedAppointments,
        upcoming,
        completed,
        today: todayAppointments,
        stats: {
          todayCount: todayAppointments.length,
          upcomingCount: upcoming.length,
          completedCount: completed.length,
        }
      },
    })
  } catch (error: any) {
    console.error('[API Doctor Appointments] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
