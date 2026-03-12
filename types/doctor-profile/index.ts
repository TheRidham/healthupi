import type { ReactNode } from "react";

// ── Doctor ────────────────────────────────────────────────────────
export interface DoctorData {
  id: string;
  user_id: string;
  name: string;
  title: string;
  specialization: string;
  subSpecialization: string;
  experience: string;
  experience_years: number;
  qualifications: string[];
  registrationNumber: string;
  clinicName: string;
  hospital?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  googleMeetLink?: string;
  languages: string[];
  base_fee?: number;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  patientsServed?: string;
  bio?: string;
  avatar?: string;
  clinicPhotoUrls?: string[];
  galleryImages?: GalleryImage[];
  services?: ApiService[];
}

export interface GalleryImage {
  src: string;
  alt: string;
}

// ── Slots ─────────────────────────────────────────────────────────
export interface SimpleSlot {
  time: string;
  endTime: string;
  duration: number;
  available: boolean;
}

export interface ApiTimeSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  appointment_duration?: number;
}

export interface Appointment {
  appointment_date: string;
  start_time?: string;
}

// ── Services ──────────────────────────────────────────────────────
export interface ServiceOption {
  id: string;
  type: "service" | "followup";
  name: string;
  icon: ReactNode;
  price: number;
  enabled: boolean;
  description: string;
}

export interface ApiService {
  id: string;
  type: "service" | "followup";
  name: string;
  price?: number;
  fee?: number;
  description?: string;
  enabled: boolean;
}

// ── Booking ───────────────────────────────────────────────────────
export interface PendingBookingData {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceType: string;
  serviceDescription: string;
  date: string;
  timeSlot: string;
  timeSlotEnd: string;
  timeSlotDuration: number;
  doctorId: string;
}

// ── View state ────────────────────────────────────────────────────
export type ViewMode = "main" | "booking" | "followup" | "success" | "verify";