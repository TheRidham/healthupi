"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Video,
  MessageSquare,
  Siren,
  RotateCcw,
  Clock,
  ArrowRight,
  User,
  Calendar,
  Loader2,
} from "lucide-react"

interface AppointmentData {
  id: string
  patient_id: string
  patient_name: string
  patient_photo: string
  service_type: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  booked_fee: number
  notes: string
}

export function CallsSection() {
  const pathname = usePathname()
  const doctorId = pathname?.split('/')[2] || ''
  
  const [todayAppointments, setTodayAppointments] = useState<AppointmentData[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorId) return
      
      try {
        const response = await fetch(`/api/doctor/${doctorId}/appointments`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setTodayAppointments(result.data.today || [])
          setUpcomingAppointments(result.data.upcoming || [])
        }
      } catch (err) {
        console.error('[CallsSection] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [doctorId])

  const formatTime = (time: string) => {
    if (!time) return '--:--'
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  const getServiceIcon = (serviceType: string) => {
    if (serviceType?.includes('video') || serviceType?.includes('Video')) {
      return <Video className="size-4" />
    }
    return <MessageSquare className="size-4" />
  }

  const getServiceLabel = (serviceType: string) => {
    if (serviceType?.includes('video') || serviceType?.includes('Video')) {
      return 'Video Call'
    }
    if (serviceType?.includes('followup') || serviceType?.includes('Follow')) {
      return 'Follow-up'
    }
    if (serviceType?.includes('home') || serviceType?.includes('Home')) {
      return 'Home Visit'
    }
    return 'Chat'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Today's Appointments */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {todayAppointments.length}
          </span>
          Today's Appointments
        </h3>
        
        {todayAppointments.length === 0 ? (
          <Card className="py-8">
            <CardContent className="text-center text-muted-foreground">
              <Calendar className="size-8 mx-auto mb-2 opacity-30" />
              <p>No appointments scheduled for today</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {todayAppointments.map((apt) => (
              <Card key={apt.id} className="py-3">
                <CardContent className="px-4 py-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{apt.patient_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getServiceIcon(apt.service_type)}
                        <span>{getServiceLabel(apt.service_type)}</span>
                        <span>•</span>
                        <Clock className="size-3" />
                        <span>{formatTime(apt.start_time)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                      {apt.status}
                    </Badge>
                    <Button size="sm" variant="outline" className="h-8">
                      Start
                      <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
            {upcomingAppointments.length}
          </span>
          Upcoming Appointments
        </h3>
        
        {upcomingAppointments.length === 0 ? (
          <Card className="py-8">
            <CardContent className="text-center text-muted-foreground">
              <Calendar className="size-8 mx-auto mb-2 opacity-30" />
              <p>No upcoming appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {upcomingAppointments.map((apt) => (
              <Card key={apt.id} className="py-3 opacity-80">
                <CardContent className="px-4 py-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{apt.patient_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{apt.appointment_date}</span>
                        <span>•</span>
                        <Clock className="size-3" />
                        <span>{formatTime(apt.start_time)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{getServiceLabel(apt.service_type)}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
