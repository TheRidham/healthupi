"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  FileText,
  User,
  Activity,
  History,
  ChevronRight,
  Phone,
  Mail,
  CalendarDays,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getPatientBookings, getUpcomingBookings, getPastBookings } from "@/services/booking.service"
import { calculateAge } from "@/lib/supabase/patient"

export default function ProfilePage() {
  const { user, patientProfile, isLoading, refreshProfile } = useAuth()

  const [appointments, setAppointments] = useState<any[]>([])
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [past, setPast] = useState<any[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)

  // Load patient appointments
  useEffect(() => {
    if (user?.role === 'patient' && user?.id) {
      console.log('[Profile Page] Loading appointments for user:', user.id)
      setLoadingAppointments(true)

      Promise.all([
        getPatientBookings(user.id),
        getUpcomingBookings(user.id),
        getPastBookings(user.id),
      ])
        .then(([all, up, pa]) => {
          console.log('[Profile Page] Loaded appointments:', { all: all.length, up: up.length, pa: pa.length })
          setAppointments(all)
          setUpcoming(up)
          setPast(pa)
          setLoadingAppointments(false)
        })
        .catch((error) => {
          console.error('Error loading appointments:', error)
          setLoadingAppointments(false)
        })
    } else {
      console.log('[Profile Page] Not loading appointments:', { role: user?.role, id: user?.id })
    }
  }, [user?.id, user?.role])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  // Redirect if not logged in
  if (!user || user.role !== 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
            <p className="text-muted-foreground mb-4">
              You need to log in to view your profile.
            </p>
            <Button onClick={() => window.location.href = '/patient/signin'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!patientProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  const displayName = patientProfile.name || 'Patient'
  const displayEmail = patientProfile.email || 'Not provided'
  const displayPhone = patientProfile.phone || 'Not provided'
  const displayDOB = patientProfile.date_of_birth
    ? format(new Date(patientProfile.date_of_birth), 'd MMM yyyy')
    : 'Not provided'
  const displayGender = patientProfile.gender || 'Not specified'
  const displayBloodGroup = patientProfile.blood_group || 'Not specified'
  const displayAddress = patientProfile.address || 'Not provided'
  const displayAge = patientProfile.date_of_birth
    ? `${calculateAge(patientProfile.date_of_birth)} years`
    : 'Not specified'
  const displayAllergies = patientProfile.allergies?.length > 0
    ? patientProfile.allergies.join(', ')
    : 'None'

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your appointments, health records, and profile
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Book Appointment CTA */}
            <Card className="py-6 border-primary/20 bg-primary/[0.02]">
              <CardContent className="px-6 py-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Book Appointment</h2>
                  <p className="text-sm text-muted-foreground">
                    Find and book appointments with top doctors
                  </p>
                </div>
                <Button className="gap-2">
                  <CalendarDays className="size-4" />
                  Browse Doctors
                </Button>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="py-4">
                <CardContent className="px-5 py-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Appointments</span>
                    <Badge variant="secondary" className="text-xs">{appointments.length}</Badge>
                  </div>
                  <span className="text-2xl font-bold text-foreground mt-2">{appointments.length}</span>
                </CardContent>
              </Card>

              <Card className="py-4">
                <CardContent className="px-5 py-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Upcoming</span>
                    <Badge variant="default" className="text-xs bg-primary">{upcoming.length}</Badge>
                  </div>
                  <span className="text-2xl font-bold text-foreground mt-2">{upcoming.length}</span>
                </CardContent>
              </Card>

              <Card className="py-4">
                <CardContent className="px-5 py-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <Badge variant="secondary" className="text-xs">{past.length}</Badge>
                  </div>
                  <span className="text-2xl font-bold text-foreground mt-2">{past.length}</span>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            {upcoming.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcoming.slice(0, 2).map((apt) => (
                      <div key={apt.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <Avatar className="size-12">
                      <AvatarImage src="/images/doctor-avatar.jpg" alt={apt.doctorName} />
                      <AvatarFallback>{apt.doctorName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">{apt.doctorName || 'Doctor'}</h3>
                              <p className="text-xs text-muted-foreground">{apt.specialization || 'Consultation'}</p>
                            </div>
                            <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                              {apt.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {apt.appointment_date ? format(new Date(apt.appointment_date), 'MMM d, yyyy') : 'TBD'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {apt.start_time}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {upcoming.length > 2 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" className="gap-1">
                        View All
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            {loadingAppointments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin" />
              </div>
            ) : (
              <>
                {appointments.length === 0 ? (
                  <Card className="py-12">
                    <CardContent className="px-6 py-0 text-center">
                      <Calendar className="size-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Appointments Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        You haven't booked any appointments yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">All Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {appointments.map((apt) => (
                          <div key={apt.id} className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <Avatar className="size-12">
                      <AvatarImage src="/images/doctor-avatar.jpg" alt={apt.doctorName} />
                      <AvatarFallback>{apt.doctorName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-sm font-semibold text-foreground">{apt.doctorName || 'Doctor'}</h3>
                                  <p className="text-xs text-muted-foreground">Video Consultation</p>
                                </div>
                                <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                                  {apt.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  {apt.appointment_date ? format(new Date(apt.appointment_date), 'MMM d, yyyy') : 'TBD'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {apt.start_time}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-start gap-6">
                  <Avatar className="size-20">
                    <AvatarImage src={patientProfile.photo_url || '/images/user-avatar.jpg'} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">{displayName}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                      <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                        <Phone className="size-4" />
                        {displayPhone}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Date of Birth</p>
                      <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                        <CalendarDays className="size-4" />
                        {displayDOB}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Age</p>
                      <p className="text-sm text-foreground font-medium">{displayAge}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gender</p>
                      <p className="text-sm text-foreground font-medium">{displayGender}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Blood Group</p>
                      <p className="text-sm text-foreground font-medium">{displayBloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Address</p>
                      <p className="text-sm text-foreground font-medium">{displayAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Allergies</p>
                      <p className="text-sm text-foreground font-medium">{displayAllergies}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Button */}
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2">
                <Activity className="size-4" />
                Edit Profile
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
