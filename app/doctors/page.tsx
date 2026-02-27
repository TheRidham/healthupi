"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/header"
import {
  Search,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Stethoscope,
  Filter,
} from "lucide-react"

interface Doctor {
  id: string
  name: string
  title: string
  specialization: string
  subSpecialization: string
  experience: string
  rating: number
  reviewCount: number
  clinicName: string
  location: string
  avatar: string
  available: boolean
}

const MOCK_DOCTORS: Doctor[] = [
  {
    id: "andrew-mitchell",
    name: "Dr. Andrew Mitchell",
    title: "Senior Consultant",
    specialization: "Internal Medicine",
    subSpecialization: "Cardiology",
    experience: "15 years",
    rating: 4.9,
    reviewCount: 842,
    clinicName: "Mitchell Cardiology Center",
    location: "San Francisco, CA",
    avatar: "/images/doctor-avatar.jpg",
    available: true,
  },
  {
    id: "sarah-johnson",
    name: "Dr. Sarah Johnson",
    title: "Consultant",
    specialization: "Dermatology",
    subSpecialization: "Cosmetic Dermatology",
    experience: "8 years",
    rating: 4.8,
    reviewCount: 523,
    clinicName: "Skin Care Clinic",
    location: "Los Angeles, CA",
    avatar: "/images/doctor-avatar.jpg",
    available: true,
  },
  {
    id: "michael-chen",
    name: "Dr. Michael Chen",
    title: "Senior Consultant",
    specialization: "Orthopedics",
    subSpecialization: "Sports Medicine",
    experience: "12 years",
    rating: 4.7,
    reviewCount: 389,
    clinicName: "Sports Injury Center",
    location: "San Diego, CA",
    avatar: "/images/doctor-avatar.jpg",
    available: true,
  },
  {
    id: "emily-williams",
    name: "Dr. Emily Williams",
    title: "Consultant",
    specialization: "Pediatrics",
    subSpecialization: "Neonatology",
    experience: "10 years",
    rating: 4.9,
    reviewCount: 712,
    clinicName: "Children's Health Center",
    location: "San Jose, CA",
    avatar: "/images/doctor-avatar.jpg",
    available: false,
  },
]

const SPECIALIZATIONS = [
  "All Specializations",
  "Internal Medicine",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "Gynecology",
  "Ophthalmology",
]

export default function DoctorsListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [specialization, setSpecialization] = useState("All Specializations")

  const filteredDoctors = MOCK_DOCTORS.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.clinicName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpec =
      specialization === "All Specializations" ||
      doctor.specialization === specialization ||
      doctor.subSpecialization === specialization
    return matchesSearch && matchesSpec
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="border-b bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Find a Doctor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and book appointments with our verified doctors
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialization, or clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger className="w-full md:w-[220px]">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredDoctors.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Stethoscope className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No doctors found matching your criteria</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setSpecialization("All Specializations")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all"
                onClick={() => router.push(`/doctor/${doctor.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative size-20 rounded-xl overflow-hidden border border-border shrink-0">
                      <Image
                        src={doctor.avatar}
                        alt={doctor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-foreground">
                              {doctor.name}
                            </h3>
                            {doctor.available && (
                              <Badge className="bg-accent text-accent-foreground border-none text-[10px]">
                                <span className="size-1.5 rounded-full bg-accent-foreground/80 mr-1.5 animate-pulse" />
                                Available
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doctor.title} • {doctor.experience}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge className="bg-primary/10 text-primary border-none text-[10px]">
                              {doctor.specialization}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {doctor.subSpecialization}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="size-4 fill-chart-4 text-chart-4" />
                          <span className="text-sm font-semibold">{doctor.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({doctor.reviewCount})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          <span>{doctor.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          <span>{doctor.clinicName}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="shrink-0 gap-1.5 self-center" asChild>
                      <span>
                        View Profile
                        <ArrowRight className="size-3.5" />
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {filteredDoctors.length} of {MOCK_DOCTORS.length} doctors
        </div>
      </div>
    </div>
  )
}
