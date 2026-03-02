import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { findDoctor } from '@/lib/server/doctor'
import { requireDoctor, handleAuthError } from '@/lib/server/auth'
import { successResponse, errorResponse } from '@/lib/server/response'

async function validateTimeSlotInput(body: any): Promise<{ valid: boolean; error?: string }> {
  const { day_of_week, start_time, end_time } = body

  if (typeof day_of_week !== 'number' || day_of_week < 0 || day_of_week > 6) {
    return { valid: false, error: 'day_of_week must be 0-6' }
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return { valid: false, error: 'Invalid time format (HH:MM or HH:MM:SS)' }
  }

  const start = start_time.split(':').slice(0,2).join(':')
  const end = end_time.split(':').slice(0,2).join(':')
  
  if (start >= end) {
    return { valid: false, error: 'start_time must be before end_time' }
  }

  return { valid: true }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    const doctor = await findDoctor(doctorId)

    if (!doctor) {
      return errorResponse('Doctor not found', 404)
    }

    const { data: timeSlots } = await supabaseAdmin
      .from('time_slots')
      .select('*')
      .eq('doctor_id', doctor.user_id)
      .order('day_of_week')
      .order('start_time')

    return successResponse({
      doctor: { user_id: doctor.user_id, name: `${doctor.first_name} ${doctor.last_name}` },
      timeSlots: timeSlots || [],
    })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireDoctor(request)
    const { id: doctorId } = await context.params
    const body = await request.json()

    const doctor = await findDoctor(doctorId)
    if (!doctor) {
      return errorResponse('Doctor not found', 404)
    }

    if (doctor.user_id !== authUser.id) {
      return errorResponse('Cannot modify another doctor\'s data', 403)
    }

    const validation = await validateTimeSlotInput(body)
    if (!validation.valid) {
      return errorResponse(validation.error!, 400)
    }

    const { day_of_week, start_time, end_time, appointment_duration = 30, is_available = true } = body

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
      return errorResponse(error.message, 500)
    }

    return successResponse(newSlot)
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireDoctor(request)
    const { id: doctorId } = await context.params
    const { searchParams } = new URL(request.url)
    const slot_id = searchParams.get('slot_id')

    if (!slot_id) {
      return errorResponse('slot_id required', 400)
    }

    const doctor = await findDoctor(doctorId)
    if (!doctor) {
      return errorResponse('Doctor not found', 404)
    }

    if (doctor.user_id !== authUser.id) {
      return errorResponse('Cannot modify another doctor\'s data', 403)
    }

    const { data: slot } = await supabaseAdmin
      .from('time_slots')
      .select('doctor_id')
      .eq('id', slot_id)
      .single()

    if (!slot || slot.doctor_id !== doctor.user_id) {
      return errorResponse('Time slot not found', 404)
    }

    const { error } = await supabaseAdmin
      .from('time_slots')
      .delete()
      .eq('id', slot_id)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse({ message: 'Time slot deleted' })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}
