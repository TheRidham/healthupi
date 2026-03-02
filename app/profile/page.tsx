"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  User,
  ChevronRight,
  Phone,
  Mail,
  CalendarDays,
  AlertCircle,
  Loader2,
  Shield,
  Edit3,
  X,
  Upload,
  FileImage,
  Plus,
  Download,
  History,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getPatientBookings } from "@/services/booking.service"
import { calculateAge } from "@/lib/supabase/patient"
import { updatePatient } from "@/services/patient.service"

export default function ProfilePage() {
  const { user, patientProfile, isLoading, refreshProfile } = useAuth()
  const router = useRouter()

  const [appointments, setAppointments] = useState<any[]>([])
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [past, setPast] = useState<any[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    blood_group: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user?.role === 'patient' && user?.id) {
      setLoadingAppointments(true)

      getPatientBookings(user.id)
        .then((all) => {
          console.log('[Profile] All appointments:', all)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          console.log('[Profile] Today:', today)

          const upcoming = all.filter(apt => {
            const aptDate = apt.appointment_date ? new Date(apt.appointment_date) : null
            const isUpcomingStatus = ['confirmed', 'pending'].includes(apt.status)
            const isUpcomingDate = aptDate && aptDate >= today
            console.log('[Profile] Appointment:', apt.id, 'date:', aptDate, 'status:', apt.status, 'is upcoming:', isUpcomingDate && isUpcomingStatus)
            return isUpcomingDate && isUpcomingStatus
          })

          const past = all.filter(apt => {
            const isPast = ['completed', 'cancelled', 'no-show'].includes(apt.status)
            const aptDate = apt.appointment_date ? new Date(apt.appointment_date) : null
            const isPastDate = aptDate && aptDate < today
            console.log('[Profile] Appointment:', apt.id, 'status:', apt.status, 'is past:', isPast || isPastDate)
            return isPast || isPastDate
          })

          console.log('[Profile] Upcoming count:', upcoming.length, 'Past count:', past.length)

          setAppointments(all)
          setUpcoming(upcoming)
          setPast(past)
          setLoadingAppointments(false)
        })
        .catch((error) => {
          console.error('Error loading appointments:', error)
          setLoadingAppointments(false)
        })
    }
  }, [user?.id, user?.role])

  useEffect(() => {
    if (patientProfile) {
      setEditedProfile({
        name: patientProfile.name || '',
        email: patientProfile.email || '',
        phone: patientProfile.phone || '',
        address: patientProfile.address || '',
        blood_group: patientProfile.blood_group || '',
      })
    }
  }, [patientProfile])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

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

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return

    setIsSaving(true)

    try {
      const result = await updatePatient(user.id, editedProfile)

      if (!result.success) {
        alert(result.error || 'Failed to update profile')
        setIsSaving(false)
        return
      }

      setIsEditing(false)
      refreshProfile()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert(error?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedProfile({
      name: patientProfile.name || '',
      email: patientProfile.email || '',
      phone: patientProfile.phone || '',
      address: patientProfile.address || '',
      blood_group: patientProfile.blood_group || '',
    })
  }

  const todayUpcoming = upcoming.filter(apt => {
    if (!apt.appointment_date) return false
    return format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6 md:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              My Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your appointments, health records, and profile
            </p>
          </div>
          <Button className="gap-1.5" onClick={() => router.push('/doctors')}>
            <Plus className="size-4" />
            Book Appointment
          </Button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start">
          <Avatar className="size-16 border-2 border-border shadow-sm">
            <AvatarImage src={patientProfile.photo_url || '/images/user-avatar.jpg'} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {displayName.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {isEditing ? (
              <Input
                type="text"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="text-xl font-semibold h-8 border-b-2 border-primary/50 focus:border-primary"
              />
            ) : (
              <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
            )}
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
              {isEditing ? (
                <Input
                  type="tel"
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  className="flex items-center gap-1 h-6 w-32 border-b border-primary/30 text-xs"
                />
              ) : (
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" /> {displayPhone}
                </span>
              )}
              {isEditing ? (
                <Input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  className="flex items-center gap-1 h-6 w-48 border-b border-primary/30 text-xs"
                />
              ) : (
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5" /> {displayEmail}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" /> {displayDOB}
              </span>
            </div>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleEditProfile}>
              <Edit3 className="size-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCancelEdit} disabled={isSaving}>
                <X className="size-4" />
                Cancel
              </Button>
              <Button size="sm" className="gap-2" onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {todayUpcoming.length > 0 && (
          <Card className="border-primary/20 bg-primary/[0.02] mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {todayUpcoming.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={apt.doctor_photo_url || '/images/doctor-avatar.jpg'} alt={apt.doctorName} />
                        <AvatarFallback>{apt.doctorName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{apt.doctorName}</p>
                        <p className="text-xs text-muted-foreground">{apt.service_name || 'Consultation'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={apt.service_name?.includes('Video') ? 'default' : 'secondary'} className="gap-1">
                        {apt.service_name?.includes('Video') ? <Video className="size-3" /> : <MessageSquare className="size-3" />}
                        {apt.service_name}
                      </Badge>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Upcoming Appointments
                <Button variant="ghost" size="sm" className="h-auto p-1 text-primary" onClick={() => router.push('/doctors')}>
                  Book New <ChevronRight className="size-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.slice(0, 2).map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar className="size-10">
                        <AvatarImage src={apt.doctor_photo_url || '/images/doctor-avatar.jpg'} alt={apt.doctorName} />
                        <AvatarFallback>{apt.doctorName?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{apt.doctorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {apt.appointment_date ? format(new Date(apt.appointment_date), 'MMM d') : 'TBD'} at {apt.start_time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {apt.service_name?.includes('Video') ? <Video className="size-3 mr-1" /> : <MessageSquare className="size-3 mr-1" />}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => router.push('/doctors')}>
                <Calendar className="size-4" /> Book New Appointment
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => document.getElementById('recent-consultations')?.scrollIntoView({ behavior: 'smooth' })}>
                <History className="size-4" /> View Medical History
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => alert('Health summary feature coming soon!')}>
                <Download className="size-4" /> Download Health Summary
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6" id="recent-consultations">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            {past.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No past consultations</p>
            ) : (
              <div className="space-y-3">
                {past.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{apt.doctorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {apt.service_name || 'Consultation'} • {apt.appointment_date ? format(new Date(apt.appointment_date), 'MMM d, yyyy') : 'TBD'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View Summary</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Medical Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileImage className="size-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
            </div>
            <Button variant="outline" className="w-full mt-4 gap-2">
              <Upload className="size-4" /> Upload New Document
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Personal Information</CardTitle>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleCancelEdit} disabled={isSaving}>
                  <X className="size-3.5" />
                  Cancel
                </Button>
                <Button size="sm" className="h-8 gap-1" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Shield className="size-3.5" />}
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleEditProfile}>
                <Edit3 className="size-3.5" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{displayDOB}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{displayAge}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{displayGender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                {isEditing ? (
                  <select
                    value={editedProfile.blood_group}
                    onChange={(e) => setEditedProfile({ ...editedProfile, blood_group: e.target.value })}
                    className="font-medium text-foreground w-full border-b border-primary/30 focus:outline-none focus:border-primary bg-transparent"
                  >
                    <option value="">Not specified</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <p className="font-medium">{displayBloodGroup}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                {isEditing ? (
                  <textarea
                    value={editedProfile.address}
                    onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                    className="font-medium text-foreground w-full border-b border-primary/30 focus:outline-none focus:border-primary resize-none text-sm"
                    rows={1}
                  />
                ) : (
                  <p className="font-medium text-sm">{displayAddress}</p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="size-4 text-destructive" />
                <p className="text-sm font-medium">Allergies</p>
              </div>
              <div className="flex gap-2">
                {patientProfile.allergies && patientProfile.allergies.length > 0 ? (
                  patientProfile.allergies.map((allergy: string, i: number) => (
                    <Badge key={i} variant="destructive">{allergy}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
