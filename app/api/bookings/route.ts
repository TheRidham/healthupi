import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { successResponse, errorResponse } from '@/lib/server/response'

function validateBookingInput(body: any): { valid: boolean; error?: string } {
  const { doctor_id, patient_id, service_id, appointment_date, start_time } = body

  if (!doctor_id) return { valid: false, error: 'doctor_id is required' }
  if (!patient_id) return { valid: false, error: 'patient_id is required' }
  if (!service_id) return { valid: false, error: 'service_id is required' }
  if (!appointment_date) return { valid: false, error: 'appointment_date is required' }
  if (!start_time) return { valid: false, error: 'start_time is required' }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(appointment_date)) {
    return { valid: false, error: 'appointment_date must be YYYY-MM-DD' }
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(start_time)) {
    return { valid: false, error: 'start_time must be HH:MM format' }
  }

  return { valid: true }
}

async function createChatConversation(appointmentId: string, doctorId: string, patientId: string) {
  try {
    // Create conversation
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('conversations')
      .insert({
        appointment_id: appointmentId,
        type: 'chat',
      })
      .select()
      .single()

    if (conversationError) {
      console.error('[Bookings API] Error creating conversation:', conversationError)
      return null
    }

    // Add doctor participant
    const { error: doctorParticipantError } = await supabaseAdmin
      .from('conversation_participants')
      .insert({
        conversation_id: conversation.id,
        user_id: doctorId,
        role: 'doctor',
      })

    if (doctorParticipantError) {
      console.error('[Bookings API] Error adding doctor participant:', doctorParticipantError)
    }

    // Add patient participant
    const { error: patientParticipantError } = await supabaseAdmin
      .from('conversation_participants')
      .insert({
        conversation_id: conversation.id,
        user_id: patientId,
        role: 'patient',
      })

    if (patientParticipantError) {
      console.error('[Bookings API] Error adding patient participant:', patientParticipantError)
    }

    return conversation
  } catch (error) {
    console.error('[Bookings API] Error in createChatConversation:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = validateBookingInput(body)
    if (!validation.valid) {
      return errorResponse(validation.error!, 400)
    }

    const {
      doctor_id,
      patient_id,
      service_id,
      appointment_date,
      start_time,
      end_time,
      notes,
      media_urls,
      paymentAmount,
      paymentMethod,
      service_name,
    } = body

    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        doctor_id,
        patient_id,
        service_id,
        appointment_date,
        start_time,
        end_time: end_time || null,
        status: 'pending',
        notes: notes || null,
        media_urls: media_urls || [],
        booked_fee: paymentAmount || 0,
      })
      .select()
      .single()

    if (appointmentError) {
      return errorResponse(appointmentError.message, 500)
    }

    // Create conversation if this is a chat service (match by service name)
    let conversation = null
    if (service_name?.toLowerCase().includes('chat')) {
      conversation = await createChatConversation(appointment.id, doctor_id, patient_id)
    }

    if (paymentAmount) {
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
        return errorResponse(paymentError.message, 500)
      }

      return successResponse(
        {
          appointment,
          payment,
          conversation: conversation || null,
        },
        201
      )
    }

    return successResponse(
      {
        appointment,
        conversation: conversation || null,
      },
      201
    )
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}
