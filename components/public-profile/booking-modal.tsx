"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowRight,
  Upload,
  X,
  Phone,
  ShieldCheck,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createBooking } from "@/services/booking.service"
import { calculateAge } from "@/lib/supabase/patient"
import { getServiceUuid } from "@/lib/utils/mock-data"
import type { ServiceOption } from "@/types"

interface TimeSlot {
  time: string
  endTime: string
  duration: number
}

interface BookingModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  service: ServiceOption
  date: Date
  timeSlot: TimeSlot
  doctorId: string
  doctorName: string
  isFollowUp: boolean
}

type Step = "details" | "processing"

function getTimeSlotDisplay(slot: TimeSlot): string {
  return `${slot.time} - ${slot.endTime}`
}

export function BookingModal({
  open,
  onClose,
  onSuccess,
  service,
  date,
  timeSlot,
  doctorId,
  doctorName,
  isFollowUp,
}: BookingModalProps) {
  const { user, patientProfile } = useAuth()
  const [step, setStep] = useState<Step>("details")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form fields
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [issue, setIssue] = useState("")

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pre-fill when modal opens with user data
  useEffect(() => {
    if (open && patientProfile) {
      setName(patientProfile.name || "")
      setPhone(patientProfile.phone || "")
      setEmail(patientProfile.email || "")
      setGender(patientProfile.gender || "")
      setAddress(patientProfile.address || "")

      if (patientProfile.date_of_birth) {
        const calculatedAge = calculateAge(patientProfile.date_of_birth)
        setAge(calculatedAge.toString())
      }

      setError("")
      setUploadedFiles([])
    }
  }, [open, patientProfile])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)])
    }
  }

  function removeFile(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    setError("")
    setLoading(true)

    // Validate form
    if (!name.trim() || !age.trim() || !gender.trim() || phone.length < 10) {
      setLoading(false)
      return
    }

    try {
      // Convert service ID to UUID
      const serviceUuid = getServiceUuid(service.id)
      console.log('[Booking Modal] Service UUID:', serviceUuid)

      // Get start time from time slot object and convert to 24-hour format
      const rawStartTime = timeSlot.time
      console.log('[Booking Modal] Raw start time:', rawStartTime)

      const timeMatch = rawStartTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
      let startHours = 0
      let startMins = 0

      if (timeMatch) {
        startHours = parseInt(timeMatch[1])
        startMins = parseInt(timeMatch[2])
        const meridiem = (timeMatch[3] || '').toUpperCase()

        if (meridiem === 'PM' && startHours !== 12) {
          startHours += 12
        } else if (meridiem === 'AM' && startHours === 12) {
          startHours = 0
        }
      }

      const startTime = `${startHours.toString().padStart(2, '0')}:${startMins.toString().padStart(2, '0')}`
      console.log('[Booking Modal] Converted start time:', startTime)

      // Calculate end time
      const endMinutes = 30
      let endHrs = startHours
      let endMins = startMins + endMinutes

      if (endMins >= 60) {
        endHrs += Math.floor(endMins / 60)
        endMins = endMins % 60
      }
      endHrs = endHrs % 24

      const endTime = `${endHrs.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`

      const bookingData = {
        doctor_id: doctorId,
        patient_id: user?.id || "",
        service_id: serviceUuid,
        appointment_date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        notes: issue,
        paymentAmount: service.price,
        paymentMethod: "upi",
      }

      console.log('[Booking Modal] Booking data:', bookingData)

      const result = await createBooking(bookingData)

      if (!result.success) {
        setError(result.error || "Failed to create booking. Please try again.")
        setLoading(false)
        return
      }

      // Success - move to processing step
      setStep("processing")

      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error: any) {
      console.error('[Booking Modal] Error submitting booking:', error)
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const isFormValid = name.trim() !== "" && age.trim() !== "" && gender.trim() !== "" && phone.length >= 10

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v && onClose) onClose()
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">
                {isFollowUp ? "Follow-up Booking" : "Book Appointment"}
              </DialogTitle>
              <DialogDescription>
                Fill in your details to confirm your booking with {doctorName}
              </DialogDescription>
            </DialogHeader>

            {/* Booking summary */}
            <Card className="py-3 bg-primary/[0.03] border-primary/15">
              <CardContent className="px-4 py-0">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {service.icon}
                    <span className="font-medium text-foreground">{service.name}</span>
                    {isFollowUp && <Badge variant="outline" className="text-[10px]">Follow-up</Badge>}
                  </div>
                  <span className="font-semibold text-primary">₹{service.price}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {format(date, "EEE, MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {getTimeSlotDisplay(timeSlot)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patient-name" className="text-xs font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patient-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patient-age" className="text-xs font-medium">
                    Age <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patient-age"
                    type="number"
                    placeholder="30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patient-gender" className="text-xs font-medium">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patient-phone" className="text-xs font-medium">
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="patient-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-9 text-sm"
                      disabled
                    />
                    <Phone className="size-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patient-email" className="text-xs font-medium">
                    Email <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </Label>
                  <Input
                    id="patient-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patient-address" className="text-xs font-medium">
                    Address <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </Label>
                  <Input
                    id="patient-address"
                    placeholder="123 Main St, City"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patient-issue" className="text-xs font-medium">
                    Describe your issue <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </Label>
                  <Input
                    id="patient-issue"
                    placeholder="Brief description of your concern"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Follow-up: prescription upload */}
              {isFollowUp && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">
                    Upload Prescription / Reports
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </Label>
                  <div>
                    <div
                      className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed hover:border-primary/40 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          fileInputRef.current?.click()
                        }
                      }}
                      role="button"
                      aria-label="Upload files"
                      tabIndex={0}
                    >
                      <Upload className="size-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground text-center">
                        Click to upload prescription, reports, or relevant media
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="flex flex-col gap-1 mt-1">
                        {uploadedFiles.map((file, i) => (
                          <div
                            key={`${file.name}-${i}`}
                            className="flex items-center justify-between bg-muted rounded-md px-3 py-2"
                          >
                            <span className="text-xs text-foreground truncate max-w-[250px]">
                              {file.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeFile(i)}
                              aria-label={`Remove ${file.name}`}
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!isFormValid || loading}
                onClick={handleSubmit}
                className="gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Book Appointment
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </>)}

          {/* Processing step */}
          {step === "processing" && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="size-8 text-primary animate-spin" />
              <div className="text-center text-sm">
                <p className="font-semibold text-foreground">Processing Booking</p>
                <p className="text-xs text-muted-foreground mt-1">Please wait while we confirm your appointment...</p>
              </div>
            </div>
          )}

          {/* ── STEP: Success ── */}
          {/* Handled by parent calling onSuccess */}
        </DialogContent>
      </Dialog>
    )
}
