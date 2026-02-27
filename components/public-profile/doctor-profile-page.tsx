"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
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
} from "lucide-react"
import { addDays, format, isSameDay, startOfToday } from "date-fns"
import { BookingModal } from "./booking-modal"
import { PaymentSuccess } from "./payment-success"
import { Header } from "@/components/header"

interface DoctorProfilePageProps {
  doctorId?: string
}

/* ── Doctor mock data ─────────────────────────────────────── */
const DOCTOR = {
  name: "Dr. Andrew Mitchell",
  title: "Senior Consultant",
  specialization: "Internal Medicine",
  subSpecialization: "Cardiology",
  experience: "15 years",
  qualifications: ["MD", "MBBS", "FACC", "Board Certified"],
  registrationNumber: "MED-2011-48293",
  clinicName: "Mitchell Cardiology Center",
  hospital: "St. Mary's Medical Center",
  address: "1234 Medical Plaza, Suite 200, San Francisco, CA 94102",
  phone: "+1 (415) 555-0192",
  website: "www.mitchellcardiology.com",
  rating: 4.9,
  reviewCount: 842,
  patientsServed: "3,200+",
  bio: "Experienced cardiologist with over 15 years of practice in interventional cardiology and preventive heart care. Passionate about leveraging telemedicine to improve patient access to quality healthcare.",
  languages: ["English", "Spanish", "Hindi"],
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
]

const FOLLOWUP_SERVICES: ServiceOption[] = [
  { id: "followup-video", type: "followup", name: "Follow-up Video Call", icon: <Video className="size-5" />, price: 300, enabled: true, description: "Video follow-up for returning patients" },
  { id: "followup-chat", type: "followup", name: "Follow-up Chat", icon: <MessageSquare className="size-5" />, price: 100, enabled: true, description: "Text follow-up for returning patients" },
]

const TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM",
]

const MORNING_SLOTS = TIME_SLOTS.filter((s) => s.includes("AM"))
const AFTERNOON_SLOTS = TIME_SLOTS.filter((s) => s.includes("PM"))

// Simulated available slots per day
function getAvailableSlots(day: Date): string[] {
  const dayOfWeek = day.getDay()
  if (dayOfWeek === 0) return [] // Sunday off
  if (dayOfWeek === 6) return ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"]
  return [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  ]
}

type ViewMode = "main" | "booking" | "followup" | "success"
type TabMode = "book" | "followup" | "profile"

export function DoctorProfilePage({ doctorId }: DoctorProfilePageProps) {
  const today = startOfToday()
  
  // TODO: Replace with actual API call when backend is ready
  // For now, use mock data. doctorId can be used to fetch specific doctor
  const currentDoctor = doctorId ? { ...DOCTOR, id: doctorId } : DOCTOR

  // Main view state
  const [view, setView] = useState<ViewMode>("main")
  const [activeTab, setActiveTab] = useState<TabMode>("book")

  // Service selection
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)

  // Date & slot selection
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<Date>(today)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Follow-up specific
  const [isFollowUp, setIsFollowUp] = useState(false)

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(today, weekOffset * 7 + i))
  }, [today, weekOffset])

  const availableSlots = useMemo(() => getAvailableSlots(selectedDay), [selectedDay])
  const morningAvailable = MORNING_SLOTS.filter((s) => availableSlots.includes(s))
  const afternoonAvailable = AFTERNOON_SLOTS.filter((s) => availableSlots.includes(s))

  function handleSelectService(service: ServiceOption) {
    setSelectedService(service)
    setSelectedSlot(null)
  }

  function handleSelectSlot(slot: string) {
    setSelectedSlot(slot)
  }

  function handleContinueToBooking() {
    if (!selectedService || !selectedSlot) return
    setIsFollowUp(selectedService.type === "followup")
    setShowBookingModal(true)
  }

  function handlePaymentSuccess() {
    setShowBookingModal(false)
    setView("success")
  }

  function handleBackToMain() {
    setView("main")
    setSelectedService(null)
    setSelectedSlot(null)
    setActiveTab("book")
  }

  function handleStartFollowUp() {
    // Check if follow-up is enabled
    const hasFollowUp = FOLLOWUP_SERVICES.some((s) => s.enabled)
    if (!hasFollowUp) {
      return // Would show a message, but follow-ups are enabled in our mock
    }
    setActiveTab("followup")
    setSelectedService(null)
    setSelectedSlot(null)
  }

  // ── Success screen ──
  if (view === "success") {
    return <PaymentSuccess onBack={handleBackToMain} doctorName={currentDoctor.name} />
  }

  const currentServiceList = activeTab === "followup" ? FOLLOWUP_SERVICES : SERVICES

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
        {/* Section tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1" role="tablist">
          {[
            { key: "book" as TabMode, label: "New Appointment", icon: <CalendarCheck className="size-3.5" /> },
            { key: "followup" as TabMode, label: "Follow-up", icon: <RotateCcw className="size-3.5" /> },
            { key: "profile" as TabMode, label: "Doctor Profile", icon: <Stethoscope className="size-3.5" /> },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              className="gap-1.5 rounded-full h-8 px-4 text-xs font-medium shrink-0"
              onClick={() => {
                setActiveTab(tab.key)
                setSelectedService(null)
                setSelectedSlot(null)
              }}
              role="tab"
              aria-selected={activeTab === tab.key}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PROFILE TAB                                            */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-6">
            {/* Hero card */}
            <Card className="overflow-hidden py-0">
              <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                <div className="absolute -bottom-10 left-6">
                  <div className="relative size-20 rounded-2xl overflow-hidden border-4 border-card shadow-md">
                    <Image src={currentDoctor.avatar} alt="Doctor photo" fill className="object-cover" />
                  </div>
                </div>
              </div>
              <CardContent className="pt-14 pb-6 px-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-foreground">{currentDoctor.name}</h1>
                    <p className="text-sm text-muted-foreground">{currentDoctor.title}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-primary/10 text-primary border-none text-[11px]">{currentDoctor.specialization}</Badge>
                      <Badge variant="outline" className="text-[11px]">{currentDoctor.subSpecialization}</Badge>
                      {currentDoctor.qualifications.map((q) => (
                        <Badge key={q} variant="secondary" className="text-[10px]">{q}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 sm:mt-0 shrink-0">
                    <Star className="size-4 fill-chart-4 text-chart-4" />
                    <span className="text-sm font-semibold text-foreground">{currentDoctor.rating}</span>
                    <span className="text-xs text-muted-foreground">({currentDoctor.reviewCount})</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">{currentDoctor.bio}</p>
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

            {/* CTA */}
            <Card className="py-4 border-primary/20 bg-primary/[0.02]">
              <CardContent className="px-5 py-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Ready to book?</p>
                  <p className="text-xs text-muted-foreground">Select a service and schedule your appointment</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setActiveTab("book"); setSelectedService(null); setSelectedSlot(null) }}>
                    Book Appointment
                    <ArrowRight className="size-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleStartFollowUp}>
                    Follow-up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* BOOKING / FOLLOW-UP TAB                                */}
        {/* ═══════════════════════════════════════════════════════ */}
        {(activeTab === "book" || activeTab === "followup") && (
          <div className="flex flex-col gap-6">
            {/* Doctor quick info */}
            <Card className="py-4">
              <CardContent className="px-5 py-0 flex items-center gap-4">
                <div className="relative size-14 rounded-xl overflow-hidden border border-border shrink-0">
                  <Image src={currentDoctor.avatar} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-foreground">{currentDoctor.name}</h2>
                  <p className="text-xs text-muted-foreground">{currentDoctor.specialization} - {currentDoctor.subSpecialization}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-chart-4 text-chart-4" />
                      <span className="text-xs font-medium text-foreground">{currentDoctor.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{currentDoctor.experience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">{currentDoctor.clinicName}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {activeTab === "followup" && (
              <Card className="py-3 border-accent/30 bg-accent/5">
                <CardContent className="px-5 py-0 flex items-center gap-3">
                  <RotateCcw className="size-4 text-accent shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Follow-up Consultation</p>
                    <p className="text-[11px] text-muted-foreground">Available for patients who consulted within the last 10 days. Reduced rates apply.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 1 - Select service */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</span>
                {activeTab === "followup" ? "Select Follow-up Service" : "Select Service"}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {currentServiceList.filter((s) => s.enabled).map((service) => {
                  const isActive = selectedService?.id === service.id
                  return (
                    <Card
                      key={service.id}
                      className={`py-3 cursor-pointer transition-all hover:shadow-sm ${
                        isActive
                          ? "border-primary ring-1 ring-primary/20 bg-primary/[0.03]"
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
                            {service.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{service.name}</span>
                              <span className="text-sm font-semibold text-primary">${service.price}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">{service.description}</span>
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
              <div>
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
                    const dayAvailable = getAvailableSlots(day).length
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
                        {format(selectedDay, "EEEE, MMMM d")} - Available slots
                      </p>
                      {morningAvailable.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-2">Morning</p>
                          <div className="flex flex-wrap gap-1.5">
                            {morningAvailable.map((slot) => {
                              const isActive = selectedSlot === slot
                              return (
                                <Toggle
                                  key={slot}
                                  variant="outline"
                                  size="sm"
                                  pressed={isActive}
                                  onPressedChange={() => handleSelectSlot(slot)}
                                  className={`text-xs h-8 px-3 ${
                                    isActive
                                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                      : ""
                                  }`}
                                >
                                  {slot}
                                </Toggle>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {afternoonAvailable.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-2">Afternoon / Evening</p>
                          <div className="flex flex-wrap gap-1.5">
                            {afternoonAvailable.map((slot) => {
                              const isActive = selectedSlot === slot
                              return (
                                <Toggle
                                  key={slot}
                                  variant="outline"
                                  size="sm"
                                  pressed={isActive}
                                  onPressedChange={() => handleSelectSlot(slot)}
                                  className={`text-xs h-8 px-3 ${
                                    isActive
                                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                      : ""
                                  }`}
                                >
                                  {slot}
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
              <Card className="py-4 border-primary/20 bg-primary/[0.02]">
                <CardContent className="px-5 py-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span>{selectedService.name}</span>
                      <Separator orientation="vertical" className="h-3.5" />
                      <span>{format(selectedDay, "MMM d")}</span>
                      <Separator orientation="vertical" className="h-3.5" />
                      <span>{selectedSlot}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total: <span className="font-semibold text-primary">${selectedService.price}</span>
                    </p>
                  </div>
                  <Button onClick={handleContinueToBooking} className="gap-1.5">
                    Continue
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
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
