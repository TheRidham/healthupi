// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = "patient" | "doctor" | "admin"

export interface User {
  id: string
  email?: string
  phone?: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
}

// ============================================================================
// PATIENT TYPES (Matches patient_profiles table)
// ============================================================================

export interface PatientProfile {
  id: string
  user_id: string
  photo_url?: string
  name: string
  date_of_birth?: Date | null
  gender?: string | null
  blood_group?: string | null
  allergies?: string[]
  phone?: string | null
  email?: string | null
  medical_conditions?: string[]
  medications?: string[]
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  created_at: Date
  updated_at: Date
}

export interface PatientProfileInput {
  user_id: string
  name: string
  phone: string
  email?: string
  date_of_birth?: string
  gender?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  blood_group?: string
  allergies?: string[]
  medical_conditions?: string[]
  medications?: string[]
  emergency_contact_name?: string
  emergency_contact_phone?: string
  photo_url?: string
}

// ============================================================================
// DOCTOR TYPES (Matches doctor_profiles table)
// ============================================================================

export interface Doctor {
  id: string
  user_id: string
  photo_url?: string
  title: string
  first_name: string
  last_name: string
  designation?: string
  about?: string
  specialization?: string
  sub_specialization?: string
  experience_years?: number
  qualifications: string[]
  registration_no: string
  clinic_name?: string
  hospital?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  email: string
  website?: string
  languages: string[]
  base_fee?: number
  availability: "online" | "busy" | "offline" | "by-appointment"
  member_since?: Date
  patients_served: number
  rating: number
  clinic_photo_urls: string[]
  created_at: Date
  updated_at: Date
}

// ============================================================================
// SERVICE TYPES (Matches services table)
// ============================================================================

export type ServiceType = "service" | "followup"

export interface Service {
  id: string
  doctor_id: string
  name: string
  type: ServiceType
  description?: string
  price: number
  duration_minutes: number
  icon?: string
  enabled: boolean
  created_at: Date
  updated_at: Date
}

// ============================================================================
// TIME SLOT TYPES (Matches time_slots table)
// ============================================================================

export interface TimeSlot {
  id: string
  doctor_id: string
  day_of_week: number // 0 = Sunday, 1 = Monday, etc.
  start_time: string
  end_time: string
  appointment_duration: number
  is_available: boolean
  created_at: Date
  updated_at: Date
}

// ============================================================================
// APPOINTMENT TYPES (Matches appointments table)
// ============================================================================

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no-show"

export interface Appointment {
  id: string
  doctor_id: string
  patient_id: string
  service_id: string
  appointment_date: Date
  start_time: string
  end_time?: string | null
  status: AppointmentStatus
  booked_fee: number
  cancellation_reason?: string | null
  cancelled_by?: string | null
  notes?: string | null
  created_at: Date
  updated_at: Date
}

export interface AppointmentInput {
  doctor_id: string
  patient_id: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
  booked_fee?: number
  notes?: string
}

export interface AppointmentWithDetails extends Appointment {
  service?: Service
  doctor?: Doctor
  patient?: PatientProfile
}

// ============================================================================
// PAYMENT TYPES (Matches payments table)
// ============================================================================

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"

export interface Payment {
  id: string
  appointment_id: string
  doctor_id: string
  patient_id: string
  amount: number
  currency: string
  payment_method?: string
  transaction_id?: string
  status: PaymentStatus
  notes?: string
  created_at: Date
  updated_at: Date
}

// ============================================================================
// CONVERSATION & MESSAGE TYPES
// ============================================================================

export interface Conversation {
  id: string
  appointment_id?: string | null
  type: "chat" | "video" | "audio" | "group"
  is_archived: boolean
  created_at: Date
  updated_at: Date
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  role: string
  joined_at: Date
  last_read_at?: Date | null
}

export type MessageType = "text" | "image" | "audio" | "file" | "video" | "document"

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: MessageType
  media_url?: string | null
  file_name?: string | null
  file_size?: number | null
  status: "sent" | "delivered" | "read"
  edited_at?: Date | null
  reacts?: string[]
  created_at: Date
}

// ============================================================================
// VIDEO CALL TYPES
// ============================================================================

export type CallStatus = "initiated" | "ringing" | "active" | "ended" | "missed" | "rejected"

export interface VideoCall {
  id: string
  appointment_id?: string | null
  conversation_id?: string | null
  doctor_id: string
  patient_id: string
  room_id?: string
  status: CallStatus
  duration_seconds?: number | null
  started_at?: Date | null
  ended_at?: Date | null
  notes?: string | null
  created_at: Date
  updated_at: Date
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = "appointment" | "payment" | "message" | "call" | "system" | "followup"

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message?: string | null
  related_id?: string | null
  related_type?: string | null
  read: boolean
  read_at?: Date | null
  action_url?: string | null
  created_at: Date
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthUser {
  id: string
  role: UserRole
  name: string
  email?: string
  phone?: string
  avatar?: string
}

export interface PendingBooking {
  doctorId: string
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceType: ServiceType
  date: string
  timeSlot: { time: string; endTime: string; duration: number }
  timeSlotEnd: string
  timeSlotDuration: number
}

export interface ServiceOption {
  id: string
  type: ServiceType
  name: string
  icon: React.ReactNode
  price: number
  enabled: boolean
  description: string
}
