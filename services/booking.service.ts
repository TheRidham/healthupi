import { supabase } from '@/lib/supabase'
import {
  createAppointment as createAppointmentDB,
  getAppointmentById,
  getAppointmentsByPatient,
  updateAppointmentStatus,
  cancelAppointment as cancelAppointmentDB,
  isTimeSlotAvailable,
} from '@/lib/supabase/appointment'
import { getDoctorUuid, fetchDoctorUuid } from '@/lib/utils/doctor'
import type { Appointment, AppointmentInput, Payment } from '@/types'

// ============================================================================
// BOOKING SERVICE - HIGH-LEVEL BOOKING OPERATIONS
// ============================================================================

/**
 * Create a new booking (appointment + payment)
 */
export async function createBooking(
  bookingData: AppointmentInput & {
    paymentAmount: number
    paymentMethod?: string
  }
): Promise<{
  success: boolean
  appointment?: Appointment
  payment?: Payment
  error?: string
}> {
  try {
    console.log('[Booking Service] Creating booking with data:', bookingData)

    // Convert doctor_id (slug) to actual UUID
    const doctorUuid = await fetchDoctorUuid(bookingData.doctor_id)
    console.log('[Booking Service] Doctor UUID:', doctorUuid)

    if (!doctorUuid) {
      return {
        success: false,
        error: 'Doctor not found. Please try again.',
      }
    }

    // Use the actual UUID for booking data
    const bookingDataWithUuid = {
      ...bookingData,
      doctor_id: doctorUuid,
    }

    // Step 1: Check if time slot is available
    const isAvailable = await isTimeSlotAvailable(
      bookingDataWithUuid.doctor_id,
      bookingDataWithUuid.appointment_date,
      bookingDataWithUuid.start_time,
      bookingDataWithUuid.end_time
    )

    console.log('[Booking Service] Time slot available:', isAvailable)

    if (!isAvailable) {
      return {
        success: false,
        error: 'This time slot is no longer available. Please select another time.',
      }
    }

    // Step 2: Call API route to create appointment and payment (server-side with service role key)
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDataWithUuid),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      console.error('[Booking Service] API error:', result.error)
      return {
        success: false,
        error: result.error || 'Failed to create booking. Please try again.',
      }
    }

    console.log('[Booking Service] Booking created via API:', result.data)

    return {
      success: true,
      appointment: result.data.appointment,
      payment: result.data.payment,
    }
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return { success: false, error: error?.message || 'Booking failed' }
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string): Promise<Appointment | null> {
  return getAppointmentById(bookingId)
}

/**
 * Get all bookings for a patient
 */
export async function getPatientBookings(
  patientId: string,
  status?: string
): Promise<Appointment[]> {
  try {
    const url = `/api/appointments?patient_id=${patientId}${status ? `&status=${status}` : ''}`
    console.log('[Booking Service] Fetching appointments from:', url)

    const response = await fetch(url)

    console.log('[Booking Service] Response status:', response.status, response.statusText)

    if (!response.ok) {
      const error = await response.json()
      console.error('[Booking Service] API error:', error)
      return []
    }

    const result = await response.json()
    console.log('[Booking Service] Result:', { success: result.success, count: result.data?.length || 0 })
    return result.data || []
  } catch (error: any) {
    console.error('[Booking Service] Error fetching appointments:', error)
    return []
  }
}

/**
 * Get upcoming bookings for a patient
 */
export async function getUpcomingBookings(patientId: string): Promise<Appointment[]> {
  return getPatientBookings(patientId, 'confirmed')
}

/**
 * Get past bookings for a patient
 */
export async function getPastBookings(patientId: string): Promise<Appointment[]> {
  try {
    const response = await fetch(`/api/appointments?patient_id=${patientId}`)
    const result = await response.json()

    if (!response.ok || !result.success) {
      console.error('[Booking Service] Error getting past bookings:', result.error)
      return []
    }

    const allAppointments = result.data || []
    return allAppointments.filter((apt: any) =>
      ['completed', 'cancelled', 'no-show'].includes(apt.status)
    )
  } catch (error: any) {
    console.error('[Booking Service] Error in getPastBookings:', error)
    return []
  }
}

/**
 * Confirm a booking (update status to 'confirmed')
 */
export async function confirmBooking(bookingId: string): Promise<{
  success: boolean
  appointment?: Appointment
  error?: string
}> {
  try {
    const appointment = await updateAppointmentStatus(bookingId, 'confirmed')

    if (!appointment) {
      return { success: false, error: 'Failed to confirm booking' }
    }

    return { success: true, appointment }
  } catch (error: any) {
    console.error('Error confirming booking:', error)
    return { success: false, error: error?.message || 'Confirmation failed' }
  }
}

/**
 * Complete a booking (update status to 'completed')
 */
export async function completeBooking(bookingId: string): Promise<{
  success: boolean
  appointment?: Appointment
  error?: string
}> {
  try {
    const appointment = await updateAppointmentStatus(bookingId, 'completed')

    if (!appointment) {
      return { success: false, error: 'Failed to complete booking' }
    }

    return { success: true, appointment }
  } catch (error: any) {
    console.error('Error completing booking:', error)
    return { success: false, error: error?.message || 'Failed to complete booking' }
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
  bookingId: string,
  reason: string,
  cancelledBy: 'doctor' | 'patient'
): Promise<{
  success: boolean
  appointment?: Appointment
  error?: string
}> {
  try {
    const appointment = await cancelAppointmentDB(bookingId, reason, cancelledBy)

    if (!appointment) {
      return { success: false, error: 'Failed to cancel booking' }
    }

    return { success: true, appointment }
  } catch (error: any) {
    console.error('Error cancelling booking:', error)
    return { success: false, error: error?.message || 'Cancellation failed' }
  }
}

/**
 * Update payment status (after payment gateway callback)
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: Payment['status'],
  transactionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (transactionId) {
      updateData.transaction_id = transactionId
    }

    const { error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)

    if (error) {
      console.error('[Booking Service] Error updating payment status:', error)
      return { success: false, error: 'Failed to update payment' }
    }

    // If payment is completed, confirm appointment
    if (status === 'completed') {
      // Get to appointment ID from payment
      const { data: payment } = await supabase
        .from('payments')
        .select('appointment_id')
        .eq('id', paymentId)
        .single()

      if (payment?.appointment_id) {
        await updateAppointmentStatus(payment.appointment_id, 'confirmed')
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in updatePaymentStatus:', error)
    return { success: false, error: error?.message || 'Failed to update payment' }
  }
}

// ============================================================================
// PAYMENT HELPERS
// ============================================================================

/**
 * Create a payment record
 */
async function createPayment(paymentData: {
  appointment_id: string
  doctor_id: string
  patient_id: string
  amount: number
  payment_method?: string
  status: Payment['status']
}): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  try {
    console.log('[Booking Service] Creating payment:', paymentData)

    const { data, error } = await supabase
      .from('payments')
      .insert({
        appointment_id: paymentData.appointment_id,
        doctor_id: paymentData.doctor_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        currency: 'INR',
        payment_method: paymentData.payment_method,
        status: paymentData.status,
      })
      .select()
      .single()

    if (error) {
      console.error('[Booking Service] Error creating payment:', error)
      console.error('[Booking Service] Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      })
      return { success: false, error: 'Failed to create payment' }
    }

    console.log('[Booking Service] Payment created successfully:', data)
    return { success: true, payment: data }
  } catch (error: any) {
    console.error('Error in createPayment:', error)
    return { success: false, error: error?.message || 'Payment creation failed' }
  }
}

/**
 * Get payment by appointment ID
 */
export async function getPaymentByAppointment(appointmentId: string): Promise<Payment | null> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error getting payment:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getPaymentByAppointment:', error)
    return null
  }
}
