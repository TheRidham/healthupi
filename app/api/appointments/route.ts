import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patient_id')
    const status = searchParams.get('status')

    console.log('[API Appointments] ===== API CALLED =====')
    console.log('[API Appointments] Patient ID:', patientId)
    console.log('[API Appointments] Status:', status || 'all')
    console.log('[API Appointments] Env vars:', {
      urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    })

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'patient_id is required' },
        { status: 400 }
      )
    }

    console.log('[API Appointments] Fetching appointments for patient:', patientId, 'status:', status || 'all')

    let query = supabaseAdmin
      .from('appointments')
      .select(`
        *,
        doctor:doctor_profiles!appointments_doctor_id_fkey(user_id, first_name, last_name, photo_url, specialization)
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('[API Appointments] Error:', error)
      console.error('[API Appointments] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('[API Appointments] Found appointments:', data?.length || 0)

    // Convert appointment_date strings to Date
    const appointments = (data || []).map(apt => ({
      ...apt,
      appointment_date: apt.appointment_date ? new Date(apt.appointment_date) : null,
    }))

    return NextResponse.json({
      success: true,
      data: appointments,
    })
  } catch (error: any) {
    console.error('[API Appointments] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}