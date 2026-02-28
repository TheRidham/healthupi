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
  ArrowLeft,
  Upload,
  X,
  Phone,
  ShieldCheck,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface BookingModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  service: { id: string; name: string; price: number; icon: React.ReactNode }
  date: Date
  timeSlot: string | { time: string; endTime: string; duration: number }
  doctorName: string
  isFollowUp: boolean
}

function getTimeSlotDisplay(slot: string | { time: string; endTime: string; duration: number }): string {
  if (typeof slot === "string") return slot
  return `${slot.time} - ${slot.endTime}`
}

type Step = "details" | "otp" | "processing"

export function BookingModal({
  open,
  onClose,
  onSuccess,
  service,
  date,
  timeSlot,
  doctorName,
  isFollowUp,
}: BookingModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>("details")

  // Pre-fill from logged in user data
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("1234567890")
  const [issue, setIssue] = useState("")

  // Pre-fill when modal opens with user data
  useEffect(() => {
    if (open && user && user.role === "patient") {
      setName(user.name || "")
      setPhone(user.id || "1234567890") // user.id is phone number for patient
      setEmail((user as any).email || "")
    }
  }, [open, user])

  // Follow-up prescription upload
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [otpError, setOtpError] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const isFormValid = name.trim() !== "" && age.trim() !== "" && gender !== "" && phone.length >= 10

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)])
    }
  }

  function removeFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSendOtp() {
    if (!isFormValid) return
    setSendingOtp(true)
    // Simulate OTP send
    setTimeout(() => {
      setSendingOtp(false)
      setStep("otp")
    }, 1200)
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpError("")
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleVerifyOtp() {
    const code = otp.join("")
    if (code !== "123456") {
      setOtpError("Invalid OTP. Use 123456")
      return
    }
    setVerifying(true)
    // Simulate verification then redirect to payment
    setTimeout(() => {
      setVerifying(false)
      setStep("processing")
      // Simulate payment gateway redirect + success
      setTimeout(() => {
        onSuccess()
      }, 2000)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* ── STEP: Patient details ── */}
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
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="patient-gender" className="text-xs font-medium">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="patient-gender" className="h-9 text-sm">
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
                  <span className="text-muted-foreground font-normal ml-1">(for OTP verification)</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="patient-phone"
                    type="tel"
                    placeholder="+1 (415) 555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="patient-email" className="text-xs font-medium">
                  Email <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="patient-email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="patient-address" className="text-xs font-medium">
                  Address <span className="text-muted-foreground font-normal">(optional)</span>
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
                  Describe your issue <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="patient-issue"
                  placeholder="Brief description of your concern"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Follow-up: prescription upload */}
              {isFollowUp && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">
                    Upload Prescription / Reports
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </Label>
                  <div
                    className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === "Enter") fileInputRef.current?.click() }}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload files"
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
                    <div className="flex flex-col gap-1.5 mt-1">
                      {uploadedFiles.map((file, i) => (
                        <div key={`${file.name}-${i}`} className="flex items-center justify-between bg-muted rounded-md px-3 py-1.5">
                          <span className="text-xs text-foreground truncate max-w-[250px]">{file.name}</span>
                          <Button variant="ghost" size="icon-sm" onClick={() => removeFile(i)} aria-label="Remove file">
                            <X className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Continue */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!isFormValid || sendingOtp}
                onClick={handleSendOtp}
                className="gap-1.5"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* ── STEP: OTP Verification ── */}
        {step === "otp" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                Verify Your Number
              </DialogTitle>
              <DialogDescription>
                We sent a 6-digit code to <span className="font-medium text-foreground">{phone}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-2">
              <div className="flex items-center gap-2">
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="size-11 text-center text-lg font-semibold"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>
              {otpError && (
                <p className="text-xs text-destructive">{otpError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {"Didn't receive the code?"}{" "}
                <button className="text-primary font-medium hover:underline" onClick={() => { setOtp(["", "", "", "", "", ""]); }}>
                  Resend
                </button>
              </p>
            </div>

            {/* Summary reminder */}
            <Card className="py-3 bg-muted/50">
              <CardContent className="px-4 py-0">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">Booking for</span>
                    <span className="font-medium text-foreground">{name}, {age}yrs</span>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex flex-col gap-0.5 items-center">
                    <span className="text-muted-foreground">{service.name}</span>
                    <span className="font-medium text-foreground">{format(date, "MMM d")} at {getTimeSlotDisplay(timeSlot)}</span>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex flex-col gap-0.5 items-end">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-primary">₹{service.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" size="sm" onClick={() => setStep("details")} className="gap-1">
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button
                size="sm"
                disabled={otp.join("").length < 6 || verifying}
                onClick={handleVerifyOtp}
                className="gap-1.5"
              >
                {verifying ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Pay ₹{service.price}
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* ── STEP: Processing payment ── */}
        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="size-8 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Processing Payment</p>
              <p className="text-xs text-muted-foreground mt-1">Redirecting to payment gateway...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
