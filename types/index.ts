export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: "patient" | "doctor" | "admin"
  avatar?: string
  createdAt: Date
}

export interface Doctor {
  id: string
  userId: string
  name: string
  title: string
  specialization: string
  subSpecialization: string
  experience: number
  qualifications: string[]
  registrationNumber: string
  clinicName: string
  hospital?: string
  address: string
  phone: string
  website?: string
  rating: number
  reviewCount: number
  patientsServed: number
  bio: string
  languages: string[]
  avatar: string
  galleryImages: { src: string; alt: string }[]
  available: boolean
}

export interface Service {
  id: string
  doctorId: string
  name: string
  type: "service" | "followup"
  price: number
  enabled: boolean
  description: string
  icon: string
}

export interface TimeSlot {
  id: string
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  appointmentDuration: number
  isAvailable: boolean
}

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  serviceId: string
  date: Date
  timeSlot: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded"
  paymentAmount: number
  createdAt: Date
}

export interface ChatMessage {
  id: string
  appointmentId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
}

export interface VideoCall {
  id: string
  appointmentId: string
  roomId: string
  status: "waiting" | "active" | "ended"
  startedAt?: Date
  endedAt?: Date
}
