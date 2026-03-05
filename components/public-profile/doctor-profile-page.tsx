"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Star,
  MapPin,
  Clock,
  Stethoscope,
  GraduationCap,
  Building2,
  Phone,
  Globe,
  Video,
  MessageSquare,
  Home,
  Siren,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  CalendarCheck,
  ShieldCheck,
  RotateCcw,
  LogIn,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { addDays, format, startOfToday, isSameDay, isBefore, setHours, setMinutes } from "date-fns"
import { BookingModal } from "./booking-modal"
import { PaymentSuccess } from "./payment-success"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { sendEmail } from "@/lib/email/emailHelper"
import { toast } from "sonner"

interface DoctorProfilePageProps {
  doctorId?: string
}

interface DoctorData {
  id: string
  user_id: string
  name: string
  title: string
  specialization: string
  subSpecialization: string
  experience: string
  experience_years: number
  qualifications: string[]
  registrationNumber: string
  clinicName: string
  hospital?: string
  address: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  email?: string
  website?: string
  googleMeetLink?: string
  languages: string[]
  base_fee?: number
  availability?: string
  rating?: number
  reviewCount?: number
  patientsServed?: string
  bio?: string
  avatar?: string
  clinicPhotoUrls?: string[]
  galleryImages?: { src: string; alt: string }[]
  services?: any[]
}

/* ── Mock Available Slots (hardcoded for UI demo) ───────────────── */
interface SimpleSlot {
  time: string
  endTime: string
  duration: number
  available: boolean
}

const TIME_SLOTS_28_FEB: SimpleSlot[] = [
  { time: "9:00 AM", endTime: "9:30 AM", duration: 30, available: true },
  { time: "9:30 AM", endTime: "10:00 AM", duration: 30, available: true },
  { time: "10:00 AM", endTime: "10:30 AM", duration: 30, available: false },
  { time: "10:30 AM", endTime: "11:00 AM", duration: 30, available: false },
  { time: "11:00 AM", endTime: "11:30 AM", duration: 30, available: true },
  { time: "11:30 AM", endTime: "12:00 PM", duration: 30, available: true },
  { time: "2:00 PM", endTime: "2:30 PM", duration: 30, available: false },
  { time: "2:30 PM", endTime: "3:00 PM", duration: 30, available: true },
  { time: "3:00 PM", endTime: "3:30 PM", duration: 30, available: true },
  { time: "3:30 PM", endTime: "4:00 PM", duration: 30, available: true },
  { time: "4:00 PM", endTime: "4:30 PM", duration: 30, available: true },
]

const TIME_SLOTS_1_MAR: SimpleSlot[] = [
  { time: "10:00 AM", endTime: "10:30 AM", duration: 30, available: true },
  { time: "10:30 AM", endTime: "11:00 AM", duration: 30, available: true },
  { time: "11:00 AM", endTime: "11:30 AM", duration: 30, available: false },
  { time: "2:00 PM", endTime: "2:30 PM", duration: 30, available: true },
  { time: "2:30 PM", endTime: "3:00 PM", duration: 30, available: true },
]

const TIME_SLOTS_OTHER: SimpleSlot[] = [
  { time: "9:00 AM", endTime: "9:30 AM", duration: 30, available: true },
  { time: "9:30 AM", endTime: "10:00 AM", duration: 30, available: true },
  { time: "10:00 AM", endTime: "10:30 AM", duration: 30, available: true },
  { time: "10:30 AM", endTime: "11:00 AM", duration: 30, available: true },
  { time: "11:00 AM", endTime: "11:30 AM", duration: 30, available: true },
  { time: "11:30 AM", endTime: "12:00 PM", duration: 30, available: true },
  { time: "2:00 PM", endTime: "2:30 PM", duration: 30, available: true },
  { time: "2:30 PM", endTime: "3:00 PM", duration: 30, available: true },
  { time: "3:00 PM", endTime: "3:30 PM", duration: 30, available: true },
  { time: "3:30 PM", endTime: "4:00 PM", duration: 30, available: true },
]

function convertToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime12h(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

function getSlotsForDate(date: Date, apiTimeSlots: any[] = [], appointments: any[] = []): SimpleSlot[] {
  const day = date.getDay()
  const dateStr = format(date, 'yyyy-MM-dd')
  
  const bookedTimes = appointments
    .filter(apt => apt.appointment_date === dateStr)
    .map(apt => apt.start_time?.substring(0, 5))
  
  if (apiTimeSlots.length > 0) {
    const daySlots = apiTimeSlots.filter(slot => slot.day_of_week === day && slot.is_available)
    if (daySlots.length === 0) return []
    
    const allSlots: SimpleSlot[] = []
    
    for (const slot of daySlots) {
      const duration = slot.appointment_duration || 30
      const startMinutes = convertToMinutes(slot.start_time)
      const endMinutes = convertToMinutes(slot.end_time)
      
      let currentMinutes = startMinutes
      while (currentMinutes + duration <= endMinutes) {
        const currentTimeStr = `${Math.floor(currentMinutes / 60).toString().padStart(2, '0')}:${(currentMinutes % 60).toString().padStart(2, '0')}`
        const time12h = minutesToTime12h(currentMinutes)
        const endTime12h = minutesToTime12h(currentMinutes + duration)
        
        allSlots.push({
          time: time12h,
          endTime: endTime12h,
          duration,
          available: !bookedTimes.includes(currentTimeStr)
        })
        
        currentMinutes += duration
      }
    }
    
    return allSlots.sort((a, b) => {
      const timeA = a.time.replace(/ AM| PM/, '')
      const timeB = b.time.replace(/ AM| PM/, '')
      return timeA.localeCompare(timeB)
    })
  }
  
  if (day === 0) return []
  if (day === 6) return TIME_SLOTS_OTHER.filter(s => parseInt(s.time.split(":")[0]) < 12)
  
  const dateStr2 = format(date, "yyyy-MM-dd")
  if (dateStr2 === "2026-02-28") return TIME_SLOTS_28_FEB
  if (dateStr2 === "2026-03-01") return TIME_SLOTS_1_MAR
  return TIME_SLOTS_OTHER
}

function getSlotCountForDate(date: Date, apiTimeSlots: any[] = [], appointments: any[] = []): number {
  return getSlotsForDate(date, apiTimeSlots, appointments).length
}

/* ── Doctor mock data ─────────────────────────────────────── */
const DOCTOR = {
  name: "Dr. Rahul Sharma",
  title: "Senior Consultant",
  specialization: "Internal Medicine",
  subSpecialization: "Cardiology",
  experience: "15 years",
  qualifications: ["MD", "MBBS", "FACC", "Board Certified"],
  registrationNumber: "MCI-2011-48293",
  clinicName: "Sharma Cardiology Center",
  hospital: "Apollo Hospital",
  address: "1234 Medical Plaza, Suite 200, Connaught Place, New Delhi, Delhi 110001",
  phone: "+91 98765 43210",
  website: "www.sharmaCardiology.com",
  rating: 4.9,
  reviewCount: 842,
  patientsServed: "3,200+",
  bio: "Experienced cardiologist with over 15 years of practice in interventional cardiology and preventive heart care. Passionate about leveraging telemedicine to improve patient access to quality healthcare.",
  languages: ["English", "Hindi", "Tamil"],
  avatar: "/images/doctor-avatar.jpg",
  galleryImages: [
    { src: "/images/clinic-1.jpg", alt: "Examination room" },
    { src: "/images/clinic-2.jpg", alt: "Reception area" },
    { src: "/images/clinic-3.jpg", alt: "Consultation office" },
  ],
}

interface ServiceOption {
  id: string
  type: "service" | "followup"
  name: string
  icon: React.ReactNode
  price: number
  enabled: boolean
  description: string
}

const SERVICES: ServiceOption[] = [
  { id: "video-call", type: "service", name: "Video Call", icon: <Video className="size-5" />, price: 500, enabled: true, description: "One-on-one video consultation" },
  { id: "chat", type: "service", name: "Chat", icon: <MessageSquare className="size-5" />, price: 200, enabled: true, description: "Text-based consultation" },
  { id: "home-visit", type: "service", name: "Home Visit", icon: <Home className="size-5" />, price: 1500, enabled: true, description: "In-person visit at your residence" },
  { id: "emergency", type: "service", name: "Emergency", icon: <Siren className="size-5" />, price: 2000, enabled: true, description: "Urgent consultations (priority)" },
  { id: "subscription", type: "service", name: "Subscription", icon: <CreditCard className="size-5" />, price: 3000, enabled: true, description: "Monthly unlimited consultations" },
  { id: "followup", type: "followup", name: "Follow-up", icon: <RotateCcw className="size-5" />, price: -1, enabled: true, description: "Follow-up for returning patients (reduced rates)" },
]

const FOLLOWUP_SERVICES: ServiceOption[] = [
  { id: "followup-video", type: "followup", name: "Follow-up Video Call", icon: <Video className="size-5" />, price: 300, enabled: true, description: "Video follow-up for returning patients" },
  { id: "followup-chat", type: "followup", name: "Follow-up Chat", icon: <MessageSquare className="size-5" />, price: 100, enabled: true, description: "Text follow-up for returning patients" },
]

type ViewMode = "main" | "booking" | "followup" | "success"

export function DoctorProfilePage({ doctorId }: DoctorProfilePageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const today = startOfToday()

  // Main view state
  const [view, setView] = useState<ViewMode>("main")

  // Service selection
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)

  // Date & slot selection
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<Date>(today)
  const [selectedSlot, setSelectedSlot] = useState<SimpleSlot | null>(null)

  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Follow-up specific
  const [isFollowUp, setIsFollowUp] = useState(false)

  // Full page vs booking mode
  const [isBookingMode, setIsBookingMode] = useState(false)

  // Refs for auto-scroll
  const timeSectionRef = useRef<HTMLDivElement>(null)
  const continueSectionRef = useRef<HTMLDivElement>(null)

  // State for doctor data from API
  const [doctor, setDoctor] = useState<DoctorData | null>(null)
  const [loadingDoctor, setLoadingDoctor] = useState(true)
  const [doctorError, setDoctorError] = useState("")
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  // Fetch doctor data from API
  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!doctorId) return

      try {
        const response = await fetch(`/api/doctor/${doctorId}`)
        const result = await response.json()

        if (result.success) {
          setDoctor(result.data)
        } else {
          setDoctorError(result.error || 'Failed to load doctor profile')
        }
      } catch (err) {
        console.error('[Doctor Profile] Error:', err)
        setDoctorError('Failed to load doctor profile')
      } finally {
        setLoadingDoctor(false)
      }
    }

    fetchDoctorData()
  }, [doctorId])

  // Fetch time slots and appointments from API
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!doctorId) return

      try {
        const today = format(new Date(), 'yyyy-MM-dd')
        const response = await fetch(`/api/doctor/${doctorId}/public-timeslots?date=${today}`)
        const result = await response.json()

        if (result.success) {
          setTimeSlots(result.data.timeSlots || [])
          setAppointments(result.data.appointments || [])
        }
      } catch (err) {
        console.error('[Doctor Profile] Error fetching time slots:', err)
      }
    }

    fetchTimeSlots()
  }, [doctorId])

  // Fetch appointments for selected day
  useEffect(() => {
    const fetchAppointmentsForDay = async () => {
      if (!doctorId) return

      try {
        const dateStr = format(selectedDay, 'yyyy-MM-dd')
        const response = await fetch(`/api/doctor/${doctorId}/public-timeslots?date=${dateStr}`)
        const result = await response.json()

        if (result.success && result.data.appointments) {
          setAppointments(result.data.appointments)
        }
      } catch (err) {
        console.error('[Doctor Profile] Error fetching appointments:', err)
      }
    }

    fetchAppointmentsForDay()
  }, [doctorId, selectedDay])

  // Smart auto-scroll function
  const scrollToElementIfNeeded = (element: HTMLElement | null) => {
    if (!element) return
    const rect = element.getBoundingClientRect()
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight
    if (!isVisible) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Check localStorage for pending booking after login
  useEffect(() => {
    const pendingBooking = localStorage.getItem("pending_booking")

    if (pendingBooking && user && user.role === "patient") {
      try {
        const booking = JSON.parse(pendingBooking)

        // Reconstruct service from stored data
        const service = {
          id: booking.serviceId,
          name: booking.serviceName,
          price: booking.servicePrice,
          type: booking.serviceType as 'service' | 'followup',
          icon: booking.serviceType === 'followup' ? <RotateCcw className="size-5" /> : <Video className="size-5" />,
          description: booking.serviceDescription || '',
          enabled: true,
        }

        setSelectedService(service)
        setSelectedDay(new Date(booking.date))

        // Create a time slot object from stored data
        const timeSlot = {
          time: booking.timeSlot,
          endTime: booking.timeSlotEnd,
          duration: booking.timeSlotDuration,
          available: true,
        }

        setSelectedSlot(timeSlot)
        setIsFollowUp(booking.serviceType === "followup")
        setIsBookingMode(true)

        // Small delay to ensure state is updated before opening modal
        setTimeout(() => {
          setShowBookingModal(true)
          localStorage.removeItem("pending_booking")
        }, 100)
      } catch (error) {
        localStorage.removeItem("pending_booking")
      }
    }
  }, [user])

  // TODO: Replace with actual API call when backend is ready
  // For now, use mock data. doctorId can be used to fetch specific doctor
  const currentDoctor = doctor ? {
    ...DOCTOR,
    ...doctor,
    id: doctorId || 'rahul-sharma',
    // Override with real data
    name: doctor.name || DOCTOR.name,
    specialization: doctor.specialization || DOCTOR.specialization,
    subSpecialization: doctor.subSpecialization || DOCTOR.subSpecialization,
    experience: doctor.experience || DOCTOR.experience,
    qualifications: doctor.qualifications || DOCTOR.qualifications,
    clinicName: doctor.clinicName || DOCTOR.clinicName,
    address: doctor.address || DOCTOR.address,
    phone: doctor.phone || DOCTOR.phone,
    website: doctor.website || DOCTOR.website,
    googleMeetLink: doctor.googleMeetLink || undefined,
    rating: doctor.rating || DOCTOR.rating,
    reviewCount: doctor.reviewCount || DOCTOR.reviewCount,
    patientsServed: doctor.patientsServed || DOCTOR.patientsServed,
    bio: doctor.bio || DOCTOR.bio,
    languages: doctor.languages || DOCTOR.languages,
    avatar: doctor.avatar || DOCTOR.avatar,
    galleryImages: doctor.galleryImages || DOCTOR.galleryImages,
  } : {
    ...DOCTOR,
    id: doctorId || 'rahul-sharma'
  }

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(today, weekOffset * 7 + i))
  }, [today, weekOffset])

  const availableSlots = useMemo(() => getSlotsForDate(selectedDay, timeSlots, appointments), [selectedDay, timeSlots, appointments])
  const morningSlots = availableSlots.filter(s => s.time.includes("AM"))
  const afternoonSlots = availableSlots.filter(s => s.time.includes("PM"))

  // Show loading state
  if (loadingDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading doctor profile...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (doctorError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-4">{doctorError}</p>
            <Button onClick={() => window.location.href = '/'}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  function handleSelectService(service: ServiceOption) {
    setSelectedService(service)
    setSelectedSlot(null)
    // Auto-scroll to time selection if not visible
    setTimeout(() => scrollToElementIfNeeded(timeSectionRef.current), 100)
  }

  function handleSelectSlot(slot: SimpleSlot) {
    if (!slot.available) return
    setSelectedSlot(slot)
    // Auto-scroll to continue button if not visible
    setTimeout(() => scrollToElementIfNeeded(continueSectionRef.current), 100)
  }

  function handleContinueToBooking() {
    if (!selectedService || !selectedSlot) return
    
    // Check if user is logged in as patient
    if (!user || user.role !== "patient") {
      // Store complete booking data including full service details
      const bookingData = {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceType: selectedService.type,
        serviceDescription: selectedService.description,
        date: selectedDay.toISOString(),
        timeSlot: selectedSlot.time,
        timeSlotEnd: selectedSlot.endTime,
        timeSlotDuration: selectedSlot.duration,
        doctorId: doctorId
      }

      console.log('[Doctor Profile] Storing pending booking:', bookingData)
      localStorage.setItem("pending_booking", JSON.stringify(bookingData))

      // Redirect to patient login with return URL
      router.push(`/patient/signin?redirect=/doctor/${doctorId}`)
      return
    }

    setIsFollowUp(selectedService.type === "followup")
    setShowBookingModal(true)
  }

  async function handlePaymentSuccess(appointmentData: any) {
    try {
      if (!appointmentData) return

      const appointmentDate = new Date(appointmentData.appointment_date)
      const formattedDate = format(appointmentDate, "d MMMM yyyy")
      const timeString = appointmentData.start_time
      
      // Use email from booking form (patientEmail) or fallback to auth user email
      const emailToUse = appointmentData.patientEmail || user?.email || ""
      const nameToUse = appointmentData.patientName || user?.name || "Patient"
      
      // Send email to patient with real data
      const res = await sendEmail("consultation", {
        patientEmail: emailToUse,
        patientName: nameToUse,
        doctorName: doctor?.name || "Doctor",
        specialization: doctor?.specialization || "",
        date: formattedDate,
        time: timeString,
        mode: appointmentData?.serviceType,
        meetingLink: doctor?.googleMeetLink || `${process.env.NEXT_PUBLIC_BASE_URL}/meet/${appointmentData.id}`,
        appointmentId: appointmentData.id,
      });

      const docRes = await sendEmail("doctorAppointmentMail", {
        doctorEmail: doctor?.email,
        patientName: nameToUse,
        doctorName: doctor?.name || "Doctor",
        specialization: doctor?.specialization || "",
        date: formattedDate,
        time: timeString,
        mode: appointmentData?.serviceType,
        meetingLink: doctor?.googleMeetLink || `${process.env.NEXT_PUBLIC_BASE_URL}/meet/${appointmentData.id}`,
        appointmentId: appointmentData.id,
      })

      if (res.success) {
        toast.success("Confirmation email sent to " + emailToUse);
      } else {
        console.error("Email sending failed:", res.error);
      }
    } catch (error) {
      console.error("Error in handlePaymentSuccess:", error);
      toast.error("There was an issue sending confirmation email");
    }

    setShowBookingModal(false)
    setView("success")
  }

  function handleBackToMain() {
    setView("main")
    setSelectedService(null)
    setSelectedSlot(null)
  }

  // Get services from API data
  const apiServices = doctor?.services || []
  
  // Combine real services and follow-ups into one list
  const allServices = [
    ...apiServices.filter((s: any) => s.enabled && s.type === 'service').map((s: any) => ({
      id: s.id,
      type: 'service' as const,
      name: s.name,
      icon: <Video className="size-5" />,
      price: s.price || s.fee || 0,
      enabled: s.enabled,
      description: s.description || '',
    })),
    ...apiServices.filter((s: any) => s.enabled && s.type === 'followup').map((s: any) => ({
      id: s.id,
      type: 'followup' as const,
      name: s.name,
      icon: <RotateCcw className="size-5" />,
      price: s.price || s.fee || 0,
      enabled: s.enabled,
      description: s.description || '',
    }))
  ]

  const currentServiceList = allServices.length > 0 ? allServices : SERVICES

  // ── Success screen ──
  if (view === "success") {
    return <PaymentSuccess onBack={handleBackToMain} doctorName={currentDoctor.name} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Top bar */}
      <header className="sticky top-14 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-9 rounded-full overflow-hidden border border-border">
              <Image src={currentDoctor.avatar} alt="" fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{currentDoctor.name}</p>
              <p className="text-[11px] text-muted-foreground">{currentDoctor.specialization}</p>
            </div>
          </div>
          <Badge className="bg-accent text-accent-foreground border-none text-[11px]">
            <span className="size-1.5 rounded-full bg-accent-foreground/80 mr-1.5 animate-pulse" />
            Available
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Booking mode - only profile + steps */}
          {isBookingMode ? (
            <>
              {/* Doctor hero card */}
              <DoctorHeroCard doctor={currentDoctor} />

              {/* Back button - changes based on mode */}
              {isFollowUp ? (
                <Button variant="ghost" size="sm" onClick={() => { setIsFollowUp(false); setSelectedService(null); setSelectedSlot(null) }} className="w-fit -ml-2 gap-1">
                  <ArrowRight className="size-3.5 rotate-180" />
                  Back to Services
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => { setIsBookingMode(false); setSelectedService(null); setSelectedSlot(null); setIsFollowUp(false) }} className="w-fit -ml-2 gap-1">
                  <ArrowRight className="size-3.5 rotate-180" />
                  Back to Profile
                </Button>
              )}

              {/* Step 1 - Select service */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</span>
                  Select Service
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentServiceList.filter((s) => s.enabled).map((service) => {
                    const isActive = selectedService?.id === service.id
                    return (
                      <Card
                        key={service.id}
                        className={`py-3 cursor-pointer transition-all hover:shadow-sm ${
                          isActive
                            ? "border-primary ring-1 ring-primary/20 bg-primary/3"
                            : "hover:border-primary/30"
                        }`}
                        onClick={() => handleSelectService(service)}
                        role="radio"
                        aria-checked={isActive}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelectService(service) }}
                      >
                        <CardContent className="px-4 py-0">
                          <div className="flex items-center gap-3">
                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                              isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              {service.type === 'followup' ? <RotateCcw className="size-5" /> : service.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                                {service.type === 'followup' && <Badge variant="secondary" className="text-[10px]">Follow-up</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {service.price > 0 ? `₹${service.price}` : 'As per previous'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Step 2 - Select time */}
              {selectedService && (
                <div ref={timeSectionRef}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">2</span>
                    Pick Date & Time
                  </h3>

                  {/* Week navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <Button variant="ghost" size="sm" onClick={() => setWeekOffset((p) => Math.max(0, p - 1))} disabled={weekOffset === 0}>
                      <ChevronLeft className="size-4" />
                    </Button>
                    <span className="text-xs font-medium text-foreground">
                      {format(days[0], "MMM d")} - {format(days[6], "MMM d, yyyy")}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setWeekOffset((p) => p + 1)}>
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>

                  {/* Day selector */}
                  <div className="grid grid-cols-7 gap-1.5 mb-4">
                    {days.map((day) => {
                      const isSelected = isSameDay(day, selectedDay)
                      const isToday = isSameDay(day, today)
                      const dayAvailable = getSlotCountForDate(day, timeSlots, appointments)
                      return (
                        <Button
                          key={day.toISOString()}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => { setSelectedDay(day); setSelectedSlot(null) }}
                          className={`group flex flex-col items-center gap-0.5 h-auto px-1.5 py-2.5 ${
                            dayAvailable === 0 ? "opacity-50" : ""
                          }`}
                          disabled={dayAvailable === 0}
                        >
                          <span className={`text-[10px] font-medium uppercase transition-colors ${
                            isSelected ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary-foreground"
                          }`}>
                            {format(day, "EEE")}
                          </span>
                          <span className={`text-base font-semibold transition-colors ${
                            isSelected ? "text-primary-foreground" : "text-foreground group-hover:text-primary-foreground"
                          }`}>
                            {format(day, "d")}
                          </span>
                          {isToday && (
                            <div className={`size-1 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary group-hover:bg-primary-foreground"}`} />
                          )}
                          {!isToday && dayAvailable > 0 && (
                            <span className={`text-[9px] transition-colors ${
                              isSelected ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-primary-foreground/80"
                            }`}>
                              {dayAvailable}
                            </span>
                          )}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Time slots */}
                  {availableSlots.length > 0 ? (
                    <Card className="py-4">
                      <CardContent className="px-4 py-0">
                        <p className="text-xs font-medium text-foreground mb-3">
                          {format(selectedDay, "EEEE, MMMM d")} - {availableSlots.length} slots available
                        </p>
                        {morningSlots.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-2">Morning</p>
                            <div className="flex flex-wrap gap-1.5">
                              {morningSlots.map((slot) => {
                                const isActive = selectedSlot?.time === slot.time
                                return (
                                  <Toggle
                                    key={slot.time}
                                    variant="outline"
                                    size="sm"
                                    pressed={isActive}
                                    onPressedChange={() => handleSelectSlot(slot)}
                                    disabled={!slot.available}
                                    className={`text-xs h-8 px-3 ${
                                      !slot.available 
                                        ? "opacity-40 cursor-not-allowed line-through" 
                                        : isActive
                                          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                          : ""
                                    }`}
                                  >
                                    {slot.time}
                                    <span className="ml-1 text-[10px] opacity-70">({slot.duration}m)</span>
                                  </Toggle>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {afternoonSlots.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-2">Afternoon / Evening</p>
                            <div className="flex flex-wrap gap-1.5">
                              {afternoonSlots.map((slot) => {
                                const isActive = selectedSlot?.time === slot.time
                                return (
                                  <Toggle
                                    key={slot.time}
                                    variant="outline"
                                    size="sm"
                                    pressed={isActive}
                                    onPressedChange={() => handleSelectSlot(slot)}
                                    disabled={!slot.available}
                                    className={`text-xs h-8 px-3 ${
                                      !slot.available 
                                        ? "opacity-40 cursor-not-allowed line-through" 
                                        : isActive
                                          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                          : ""
                                    }`}
                                  >
                                    {slot.time}
                                    <span className="ml-1 text-[10px] opacity-70">({slot.duration}m)</span>
                                  </Toggle>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="py-8">
                      <CardContent className="px-5 py-0 text-center">
                        <p className="text-sm text-muted-foreground">No available slots on this day</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Continue button */}
              {selectedService && selectedSlot && (
                <Card ref={continueSectionRef} className="py-4 border-primary/20 bg-primary/[0.02]">
                  <CardContent className="px-5 py-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span>{selectedService.name}</span>
                        <Separator orientation="vertical" className="h-3.5" />
                        <span>{format(selectedDay, "MMM d")}</span>
                        <Separator orientation="vertical" className="h-3.5" />
                        <span>{selectedSlot.time} - {selectedSlot.endTime}</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{selectedSlot.duration}m</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Total: <span className="font-semibold text-primary">₹{selectedService.price}</span>
                      </p>
                    </div>
                    <Button onClick={handleContinueToBooking} className="gap-1.5">
                      Continue
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              {/* Full page view - profile + ready to book + info cards */}
              {/* Doctor hero card */}
              <DoctorHeroCard doctor={currentDoctor} />

              {/* Ready to book card */}
              <Card className="py-4 border-primary/20 bg-primary/[0.02]">
                <CardContent className="px-5 py-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ready to book?</p>
                    <p className="text-xs text-muted-foreground">Select a service and schedule your appointment</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setIsBookingMode(true)} className="gap-1.5">
                      Book Appointment
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info cards grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="py-4">
                  <CardHeader className="px-5 py-0 pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Stethoscope className="size-4 text-primary" />
                      Professional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-0">
                    <div className="flex flex-col gap-2.5">
                      <InfoRow icon={<GraduationCap className="size-3.5" />} label="Experience" value={currentDoctor.experience} />
                      <InfoRow icon={<ShieldCheck className="size-3.5" />} label="Registration" value={currentDoctor.registrationNumber} />
                      <InfoRow icon={<Users className="size-3.5" />} label="Patients" value={currentDoctor.patientsServed} />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Languages</span>
                        <div className="flex gap-1">
                          {currentDoctor.languages.map((l) => (
                            <Badge key={l} variant="outline" className="text-[10px] px-1.5">{l}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="py-4">
                  <CardHeader className="px-5 py-0 pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="size-4 text-primary" />
                      Clinic
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-0">
                    <div className="flex flex-col gap-2.5">
                      <InfoRow icon={<Building2 className="size-3.5" />} label="Clinic" value={currentDoctor.clinicName} />
                      <InfoRow icon={<Building2 className="size-3.5" />} label="Hospital" value={currentDoctor.hospital} />
                      <InfoRow icon={<MapPin className="size-3.5" />} label="Address" value={currentDoctor.address} />
                      <InfoRow icon={<Phone className="size-3.5" />} label="Phone" value={currentDoctor.phone} />
                      <InfoRow icon={<Globe className="size-3.5" />} label="Website" value={currentDoctor.website} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gallery */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Clinic Photos</h3>
                <div className="grid grid-cols-3 gap-3">
                  {currentDoctor.galleryImages.map((img) => (
                    <div key={img.src} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border group">
                      <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Booking modal */}
      {showBookingModal && selectedService && selectedSlot && (
        <BookingModal
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handlePaymentSuccess}
          service={selectedService}
          date={selectedDay}
          timeSlot={selectedSlot}
          doctorId={doctorId || 'rahul-sharma'}
          doctorName={currentDoctor.name}
          isFollowUp={isFollowUp}
        />
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs text-foreground font-medium text-right truncate max-w-[200px]">{value}</span>
    </div>
  )
}

function DoctorHeroCard({ doctor }: { doctor: typeof DOCTOR }) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="absolute -bottom-8 left-6">
          <div className="relative size-16 rounded-2xl overflow-hidden border-4 border-card shadow-md">
            <Image src={doctor.avatar} alt="Doctor photo" fill className="object-cover" />
          </div>
        </div>
      </div>
      <CardContent className="pt-11 pb-4 px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{doctor.name}</h1>
            <p className="text-xs text-muted-foreground">{doctor.title}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-none text-[10px]">{doctor.specialization}</Badge>
              <Badge variant="outline" className="text-[10px]">{doctor.subSpecialization}</Badge>
              {doctor.qualifications.slice(0, 2).map((q) => (
                <Badge key={q} variant="secondary" className="text-[9px]">{q}</Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0">
            <div className="flex items-center gap-1">
              <Star className="size-3.5 fill-chart-4 text-chart-4" />
              <span className="text-sm font-semibold text-foreground">{doctor.rating}</span>
              <span className="text-[10px] text-muted-foreground">({doctor.reviewCount})</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">{doctor.bio}</p>
      </CardContent>
    </Card>
  )
}
