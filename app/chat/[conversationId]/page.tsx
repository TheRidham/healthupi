"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { parseISO } from "date-fns"
import { ChatProvider } from "@/context/ChatProvider"
import { useAuth } from "@/context/AuthProvider"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ChatLayout from "@/components/chat/chat-layout"

// ─── Helper Functions ─────────────────────────────────────────────────────────

function isAppointmentTimeArrived(appointmentDate: string, startTime: string): boolean {
  const [hours, minutes] = startTime.split(":").map(Number);
  const appointmentDateTime = parseISO(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  return now >= appointmentDateTime;
}

function getAppointmentDateTime(appointmentDate: string, startTime: string): Date {
  const [hours, minutes] = startTime.split(":").map(Number);
  const appointmentDateTime = parseISO(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  return appointmentDateTime;
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string
  const { user, loading: userLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [showTimeDialog, setShowTimeDialog] = useState(false)
  const [appointmentTime, setAppointmentTime] = useState<Date | null>(null)
  const [isTimeValid, setIsTimeValid] = useState(true)

  // Check if appointment time has arrived
  useEffect(() => {
    const checkAppointmentTime = async () => {
      try {
        setLoading(true)
        
        // Fetch appointment details via conversation ID
        const response = await fetch(`/api/chat/appointment/${conversationId}`)
        
        if (!response.ok) {
          console.error("Failed to fetch appointment details")
          setLoading(false)
          return
        }

        const data = await response.json()
        
        if (!data.success || !data.appointment) {
          console.error("No appointment found for this conversation")
          setLoading(false)
          return
        }

        const appointment = data.appointment
        const { appointment_date, start_time } = appointment

        // Check if appointment time has arrived
        const timeArrived = isAppointmentTimeArrived(appointment_date, start_time)
        
        if (!timeArrived) {
          const appointmentDateTime = getAppointmentDateTime(appointment_date, start_time)
          setAppointmentTime(appointmentDateTime)
          setIsTimeValid(false)
          setShowTimeDialog(true)
        } else {
          setIsTimeValid(true)
        }
      } catch (error) {
        console.error("Error checking appointment time:", error)
        // On error, allow access to chat
        setIsTimeValid(true)
      } finally {
        setLoading(false)
      }
    }

    if (!userLoading && user?.id && conversationId) {
      checkAppointmentTime()
    }
  }, [userLoading, user?.id, conversationId])

  // Wait for user to be loaded
  if (userLoading || loading) {
    return (
      <div className="py-2 h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="py-2 h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access chat</p>
        </div>
      </div>
    )
  }

  // Show time check dialog if appointment time hasn't arrived
  if (!isTimeValid && appointmentTime) {
    return (
      <>
        <AlertDialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Appointment Not Yet Started</AlertDialogTitle>
              <AlertDialogDescription>
                Your chat appointment will be available starting at{" "}
                <span className="font-semibold text-foreground">
                  {appointmentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {" "}on{" "}
                <span className="font-semibold text-foreground">
                  {appointmentTime.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                . Please try again at the scheduled time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setShowTimeDialog(false)
                  router.push("/patient")
                }}
                className="bg-primary"
              >
                Go to Home
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <div className="py-2 h-screen">
      <ChatProvider conversationId={conversationId} userId={user.id}>
        <ChatLayout currentUserId={user.id} conversationId={conversationId} />
      </ChatProvider>
    </div>
  )
}