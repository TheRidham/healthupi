"use client"

import { useState } from "react"
import Image from "next/image"
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
  Upload,
  User,
  Activity,
  History,
  Settings,
  ChevronRight,
  Plus,
  Phone,
  Mail,
  CalendarDays,
  AlertCircle,
} from "lucide-react"

interface UserProfile {
  name: string
  phone: string
  email: string
  dateOfBirth: string
  gender: string
  bloodGroup: string
  allergies: string[]
  avatar: string
}

interface Appointment {
  id: string
  doctorName: string
  doctorSpecialization: string
  doctorAvatar: string
  service: string
  date: string
  time: string
  status: "upcoming" | "completed" | "cancelled"
  type: "video" | "chat" | "followup"
}

interface PastConsultation {
  id: string
  doctorName: string
  specialization: string
  date: string
  diagnosis: string
  prescriptions: string[]
}

const MOCK_USER: UserProfile = {
  name: "Amita Sharma",
  phone: "1234567890",
  email: "amita.sharma@email.com",
  dateOfBirth: "15 Aug 1995",
  gender: "Female",
  bloodGroup: "B+",
  allergies: ["Penicillin", "Dust"],
  avatar: "/images/user-avatar.jpg",
}

const UPCOMING_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    doctorName: "Dr. Rahul Sharma",
    doctorSpecialization: "Cardiology",
    doctorAvatar: "/images/doctor-avatar.jpg",
    service: "Video Consultation",
    date: "28 Feb 2026",
    time: "10:00 AM",
    status: "upcoming",
    type: "video",
  },
  {
    id: "2",
    doctorName: "Dr. Priya Patel",
    doctorSpecialization: "Dermatology",
    doctorAvatar: "/images/doctor-avatar.jpg",
    service: "Follow-up Chat",
    date: "01 Mar 2026",
    time: "02:30 PM",
    status: "upcoming",
    type: "chat",
  },
]

const ACTIVE_SESSIONS: Appointment[] = [
  {
    id: "3",
    doctorName: "Dr. Rahul Sharma",
    doctorSpecialization: "Cardiology",
    doctorAvatar: "/images/doctor-avatar.jpg",
    service: "Active Video Call",
    date: "Today",
    time: "10:00 AM",
    status: "upcoming",
    type: "video",
  },
]

const PAST_APPOINTMENTS: Appointment[] = [
  {
    id: "4",
    doctorName: "Dr. Raj Kumar",
    doctorSpecialization: "Orthopedics",
    doctorAvatar: "/images/doctor-avatar.jpg",
    service: "Video Consultation",
    date: "20 Feb 2026",
    time: "11:00 AM",
    status: "completed",
    type: "video",
  },
  {
    id: "5",
    doctorName: "Dr. Anita Reddy",
    doctorSpecialization: "Pediatrics",
    doctorAvatar: "/images/doctor-avatar.jpg",
    service: "Chat Consultation",
    date: "15 Feb 2026",
    time: "04:00 PM",
    status: "completed",
    type: "chat",
  },
  {
    id: "6",
    doctorName: "Dr. Priya Patel",
    doctorSpecialization: "Dermatology",
    doctorAvatar: "/images/doctor-avatar.jpg",
    service: "Follow-up Video",
    date: "10 Feb 2026",
    time: "09:30 AM",
    status: "completed",
    type: "followup",
  },
]

const PAST_CONSULTATIONS: PastConsultation[] = [
  {
    id: "1",
    doctorName: "Dr. Raj Kumar",
    specialization: "Orthopedics",
    date: "20 Feb 2026",
    diagnosis: "Lumbar Spondylosis",
    prescriptions: ["Painkiller", "Physiotherapy", "Vitamin D"],
  },
  {
    id: "2",
    doctorName: "Dr. Anita Reddy",
    specialization: "Pediatrics",
    date: "15 Feb 2026",
    diagnosis: "Viral Fever",
    prescriptions: ["Paracetamol", "ORS", "Rest"],
  },
]

const USER_TABS = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "appointments", label: "Appointments", icon: Calendar },
  { key: "history", label: "Medical History", icon: History },
  { key: "details", label: "Personal Details", icon: User },
] as const

export default function UserProfilePage() {
  const [user] = useState<UserProfile>(MOCK_USER)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6 md:px-6 overflow-x-hidden">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight text-balance">
              My Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your appointments, health records, and profile
            </p>
          </div>
          <Button className="gap-1.5" onClick={() => window.location.href = "/doctors"}>
            <Plus className="size-4" />
            Book Appointment
          </Button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start">
          <Avatar className="size-16 border-2 border-border shadow-sm">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" /> +91 {user.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" /> {user.email}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" /> {user.dateOfBirth}
              </span>
              <Badge variant="outline" className="text-[10px]">{user.bloodGroup}</Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="gap-6">
          <TabsList className="w-full md:w-auto h-10">
            {USER_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5">
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label === "Overview" ? "Overview" : tab.label === "Personal Details" ? "Details" : tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-0">
            {ACTIVE_SESSIONS.length > 0 && (
              <Card className="border-primary/20 bg-primary/[0.02]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {ACTIVE_SESSIONS.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full overflow-hidden">
                            <Image src={session.doctorAvatar} alt="" width={40} height={40} className="object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{session.doctorName}</p>
                            <p className="text-xs text-muted-foreground">{session.doctorSpecialization}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={session.type === "video" ? "default" : "secondary"} className="gap-1">
                            {session.type === "video" ? <Video className="size-3" /> : <MessageSquare className="size-3" />}
                            {session.service}
                          </Badge>
                          <Button size="sm">Join Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    Upcoming Appointments
                    <Button variant="ghost" size="sm" className="h-auto p-1 text-primary" onClick={() => document.querySelector('[data-state][value="appointments"]')?.dispatchEvent(new Event('click'))}>
                      View All <ChevronRight className="size-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {UPCOMING_APPOINTMENTS.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
                  ) : (
                    <div className="space-y-3">
                      {UPCOMING_APPOINTMENTS.slice(0, 2).map((apt) => (
                        <div key={apt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="size-10 rounded-full overflow-hidden shrink-0">
                            <Image src={apt.doctorAvatar} alt="" width={40} height={40} className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{apt.doctorName}</p>
                            <p className="text-xs text-muted-foreground">{apt.date} at {apt.time}</p>
                          </div>
                          <Badge variant={apt.type === "video" ? "default" : "secondary"} className="text-[10px]">
                            {apt.type === "video" ? <Video className="size-3 mr-1" /> : <MessageSquare className="size-3 mr-1" />}
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
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = "/doctors"}>
                    <Calendar className="size-4" /> Book New Appointment
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="size-4" /> Upload Prescription
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Upload className="size-4" /> Upload Medical Reports
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PAST_CONSULTATIONS.map((consult) => (
                    <div key={consult.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{consult.doctorName}</p>
                          <p className="text-xs text-muted-foreground">{consult.specialization} • {consult.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Appointments</h2>
              <Button onClick={() => window.location.href = "/doctors"}>Book New</Button>
            </div>

            {UPCOMING_APPOINTMENTS.map((apt) => (
              <Card key={apt.id} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full overflow-hidden">
                        <Image src={apt.doctorAvatar} alt="" width={48} height={48} className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{apt.doctorSpecialization}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="size-3" /> {apt.date}</span>
                          <span className="flex items-center gap-1"><Clock className="size-3" /> {apt.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="default" className="gap-1">
                        {apt.type === "video" ? <Video className="size-3" /> : <MessageSquare className="size-3" />}
                        {apt.service}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Separator className="my-4" />
            <h3 className="text-md font-semibold text-muted-foreground">Past Appointments</h3>

            {PAST_APPOINTMENTS.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full overflow-hidden">
                        <Image src={apt.doctorAvatar} alt="" width={48} height={48} className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{apt.doctorSpecialization}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="size-3" /> {apt.date}</span>
                          <span className="flex items-center gap-1"><Clock className="size-3" /> {apt.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <MessageSquare className="size-3" />
                        Completed
                      </Badge>
                      <Button size="sm" variant="outline">View Summary</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-0">
            <h2 className="text-lg font-semibold">Medical History</h2>
            
            {PAST_CONSULTATIONS.map((consult) => (
              <Card key={consult.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{consult.doctorName}</CardTitle>
                    <Badge variant="outline">{consult.date}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{consult.specialization}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Diagnosis</p>
                      <p className="text-sm text-muted-foreground">{consult.diagnosis}</p>
                    <div>
                      </div>
                    <p className="text-sm font-medium">Prescriptions</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {consult.prescriptions.map((rx, i) => (
                          <li key={i}>{rx}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">View Report</Button>
                      <Button size="sm" variant="outline">Download Rx</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Blood Test Report.pdf</p>
                        <p className="text-xs text-muted-foreground">Uploaded on 10 Feb 2026</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">X-Ray Scan.jpg</p>
                        <p className="text-xs text-muted-foreground">Uploaded on 20 Jan 2026</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 gap-2">
                  <Upload className="size-4" /> Upload New Document
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-0">
            <h2 className="text-lg font-semibold">Personal Details</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{user.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{user.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <p className="font-medium">{user.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">+91 {user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="size-4 text-destructive" />
                    <p className="text-sm font-medium">Allergies</p>
                  </div>
                  <div className="flex gap-2">
                    {user.allergies.map((allergy, i) => (
                      <Badge key={i} variant="destructive">{allergy}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="outline">Edit Details</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">Priya Sharma</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="font-medium">Spouse</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">+91 98765 43211</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">Edit Contact</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
