// Booking flow types

export interface TimeSlot {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  appointment_duration: number;
  is_available: boolean;
}

export interface AvailableSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  duration: number; // minutes
  period: "morning" | "afternoon" | "evening";
  formattedStart: string; // "10:00 AM"
  formattedEnd: string; // "10:30 AM"
}

export interface SelectedSlot {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  dayOfWeek: number;
}

export interface BookingFormData {
  fullName: string;
  age: number;
  gender: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  issueDescription?: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  name?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  allergies?: string;
  medical_conditions?: string;
}

export interface BookingState {
  step: "service" | "timeSlot" | "auth" | "form" | "payment" | "success" | null;
  selectedServices: Array<{
    id: string;
    name: string;
    duration: number;
    fee?: number;
  }>;
  selectedSlot: SelectedSlot | null;
  patientData: BookingFormData | null;
  appointmentId: string | null;
  confirmationNumber: string | null;
}

export interface CreateAppointmentPayload {
  doctorId: string;
  patientData: BookingFormData;
  slot: SelectedSlot;
  services: Array<{ id: string; name: string; fee?: number }>;
  razorpayOrderId: string;
}

export interface AppointmentResponse {
  success: boolean;
  appointmentId: string;
  confirmationNumber: string;
  appointmentDate: string;
  appointmentTime: string;
}
