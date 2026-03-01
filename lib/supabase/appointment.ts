import { supabase } from '../supabase'
import type { Appointment, AppointmentInput, AppointmentWithDetails } from '@/types'

// ============================================================================
// APPOINTMENT CRUD OPERATIONS
// ============================================================================

/**
 * Create a new appointment
 */
export async function createAppointment(input: AppointmentInput): Promise<Appointment | null> {
  try {
    console.log('[Appointment DB] Creating appointment:', input)

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        doctor_id: input.doctor_id,
        patient_id: input.patient_id,
        service_id: input.service_id,
        appointment_date: input.appointment_date,
        start_time: input.start_time,
        end_time: input.end_time,
        status: 'pending',
        notes: input.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('[Appointment DB] Error creating appointment:', error)
      console.error('[Appointment DB] Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      })
      return null
    }

    console.log('[Appointment DB] Appointment created successfully:', data)

    // Convert appointment_date string to Date
    if (data?.appointment_date) {
      data.appointment_date = new Date(data.appointment_date)
    }

    return data
  } catch (error) {
    console.error('Error in createAppointment:', error)
    return null
  }
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(appointmentId: string): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error getting appointment:', error)
      return null
    }

    // Convert appointment_date string to Date
    if (data?.appointment_date) {
      data.appointment_date = new Date(data.appointment_date)
    }

    return data
  } catch (error) {
    console.error('Error in getAppointmentById:', error)
    return null
  }
}

/**
 * Get all appointments for a patient
 */
export async function getAppointmentsByPatient(
  patientId: string,
  status?: string
): Promise<Appointment[]> {
  try {
    console.log('[Appointment DB] Getting appointments for patient:', patientId, 'status:', status || 'all')

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error getting patient appointments:', error)
      console.error('Patient appointments error details:', {
        code: (error as any).code,
        message: (error as any).message,
        details: (error as any).details,
        hint: (error as any).hint,
      })
      return []
    }

    console.log('[Appointment DB] Got appointments:', data?.length || 0, 'appointments')

    // Convert appointment_date strings to Date
    return (data || []).map(apt => ({
      ...apt,
      appointment_date: apt.appointment_date ? new Date(apt.appointment_date) : null,
    }))
  } catch (error) {
    console.error('Error in getAppointmentsByPatient:', error)
    return []
  }
}

/**
 * Get all appointments for a doctor
 */
export async function getAppointmentsByDoctor(
  doctorId: string,
  status?: string
): Promise<Appointment[]> {
  try {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error getting doctor appointments:', error)
      return []
    }

    // Convert appointment_date strings to Date
    return (data || []).map(apt => ({
      ...apt,
      appointment_date: apt.appointment_date ? new Date(apt.appointment_date) : null,
    }))
  } catch (error) {
    console.error('Error in getAppointmentsByDoctor:', error)
    return []
  }
}

/**
 * Get appointments with details (includes service, doctor, patient info)
 */
export async function getAppointmentWithDetails(
  appointmentId: string
): Promise<AppointmentWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(*),
        doctor:doctor_profiles!doctor_id(user_id, first_name, last_name, photo_url, specialization, phone, email),
        patient:patient_profiles!patient_id(name, phone, email)
      `)
      .eq('id', appointmentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error getting appointment details:', error)
      return null
    }

    // Convert appointment_date string to Date
    if (data?.appointment_date) {
      data.appointment_date = new Date(data.appointment_date)
    }

    return data
  } catch (error) {
    console.error('Error in getAppointmentWithDetails:', error)
    return null
  }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: Appointment['status'],
  cancellationReason?: string,
  cancelledBy?: string
): Promise<Appointment | null> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (cancellationReason) {
      updateData.cancellation_reason = cancellationReason
    }

    if (cancelledBy) {
      updateData.cancelled_by = cancelledBy
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating appointment status:', error)
      return null
    }

    // Convert appointment_date string to Date
    if (data?.appointment_date) {
      data.appointment_date = new Date(data.appointment_date)
    }

    return data
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error)
    return null
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  appointmentId: string,
  reason: string,
  cancelledBy: 'doctor' | 'patient'
): Promise<Appointment | null> {
  return updateAppointmentStatus(
    appointmentId,
    'cancelled',
    reason,
    cancelledBy
  )
}

/**
 * Check if a time slot is available for a doctor
 */
export async function isTimeSlotAvailable(
  doctorId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  try {
    console.log('[Appointment DB] Checking time slot availability:', { doctorId, date, startTime, endTime })

    // Check for overlapping appointments
    const { data, error } = await supabase
      .from('appointments')
      .select('id, start_time, end_time, status')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .in('status', ['pending', 'confirmed'])

    if (error) {
      console.error('[Appointment DB] Error checking time slot availability:', error)
      console.error('[Appointment DB] Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      })
      return true // Allow booking if check fails
    }

    console.log('[Appointment DB] Existing appointments on this date:', data?.length || 0)

    if (!data || data.length === 0) {
      return true
    }

    // Check for overlaps
    const newStart = timeToMinutes(startTime)
    const newEnd = timeToMinutes(endTime)

    for (const apt of data) {
      const aptStart = timeToMinutes(apt.start_time)
      const aptEnd = apt.end_time ? timeToMinutes(apt.end_time) : aptStart + 30

      // Check if time ranges overlap
      if (newStart < aptEnd && newEnd > aptStart) {
        return false // Slot is already booked
      }
    }

    return true
  } catch (error) {
    console.error('Error in isTimeSlotAvailable:', error)
    return true // Allow booking if check fails
  }
}

/**
 * Helper: Convert time string "HH:MM" to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
