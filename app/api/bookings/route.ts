import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      doctor_id,
      patient_id,
      service_id,
      appointment_date,
      start_time,
      end_time,
      notes,
      paymentAmount,
      paymentMethod
    } = body

    console.log('[API Booking] Creating appointment with:', {
      doctor_id,
      patient_id,
      service_id,
      appointment_date,
      start_time,
      end_time,
    })

    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        doctor_id,
        patient_id,
        service_id,
        appointment_date,
        start_time,
        end_time,
        status: 'pending',
        notes: notes || null,
        booked_fee: paymentAmount,
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('[API Booking] Error creating appointment:', appointmentError)
      return NextResponse.json(
        { success: false, error: appointmentError.message },
        { status: 500 }
      )
    }

    console.log('[API Booking] Appointment created:', appointment.id)

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        appointment_id: appointment.id,
        patient_id,
        doctor_id,
        amount: paymentAmount,
        status: 'pending',
        payment_method: paymentMethod,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('[API Booking] Error creating payment:', paymentError)
      return NextResponse.json(
        { success: false, error: paymentError.message },
        { status: 500 }
      )
    }

    console.log('[API Booking] Payment created:', payment.id)

    return NextResponse.json({
      success: true,
      data: {
        appointment,
        payment,
      }
    })
  } catch (error: any) {
    console.error('[API Booking] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}