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

// GET: Fetch doctor's time slots
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    const doctor = await findDoctor(doctorId)

    if (!doctor) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 })
    }

    const { data: timeSlots } = await supabaseAdmin
      .from('time_slots')
      .select('*')
      .eq('doctor_id', doctor.user_id)
      .order('day_of_week')
      .order('start_time')

    return NextResponse.json({
      success: true,
      data: {
        doctor: { user_id: doctor.user_id, name: `${doctor.first_name} ${doctor.last_name}` },
        timeSlots: timeSlots || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST: Add a new time slot
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    const body = await request.json()
    const { day_of_week, start_time, end_time, appointment_duration = 30, is_available = true } = body

    const doctor = await findDoctor(doctorId)
    if (!doctor) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 })
    }

    const { data: newSlot, error } = await supabaseAdmin
      .from('time_slots')
      .insert({
        doctor_id: doctor.user_id,
        day_of_week,
        start_time,
        end_time,
        appointment_duration,
        is_available,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: newSlot })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE: Remove a time slot
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const slot_id = searchParams.get('slot_id')

    if (!slot_id) {
      return NextResponse.json({ success: false, error: 'slot_id required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('time_slots')
      .delete()
      .eq('id', slot_id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
