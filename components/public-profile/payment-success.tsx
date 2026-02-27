"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Calendar, Clock, ArrowLeft, User } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface PaymentSuccessProps {
  onBack: () => void
  doctorName: string
  serviceName?: string
  date?: Date
  timeSlot?: string
}

export function PaymentSuccess({
  onBack,
  doctorName,
  serviceName = "Video Consultation",
  date,
  timeSlot,
}: PaymentSuccessProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Check className="size-8 text-accent" />
          </div>
          
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your appointment with {doctorName} has been successfully booked.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{serviceName}</span>
              </div>
              {date && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{format(date, "EEEE, MMMM d, yyyy")}</span>
                </div>
              )}
              {timeSlot && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{timeSlot}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              A confirmation message has been sent to your phone and email.
            </p>
            <Button variant="outline" className="w-full" onClick={onBack}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Doctor Profile
            </Button>
            <Button className="w-full gap-2" onClick={() => router.push("/profile")}>
              <User className="size-4" />
              Go to My Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
