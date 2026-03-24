"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Stethoscope,
  Loader2,
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

export default function DoctorsListPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors-list")
        if (!response.ok) return
        const result = await response.json()
        if (result.success) setDoctors(result.data)
      } catch (error) {
        console.error("[Doctors Page]", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  return (
    <div className="min-h-screen bg-background">

      <div className="border-b bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Find a Doctor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and book appointments with our verified doctors
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : doctors.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Stethoscope className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No doctors available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {doctors.map((doctor) => (
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
                            {doctor.subSpecialization && (
                              <Badge variant="outline" className="text-[10px]">
                                {doctor.subSpecialization}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {doctor.rating > 0 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="size-4 fill-chart-4 text-chart-4" />
                            <span className="text-sm font-semibold">{doctor.rating}</span>
                            <span className="text-xs text-muted-foreground">
                              ({doctor.reviewCount})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        {doctor.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            <span>{doctor.location}</span>
                          </div>
                        )}
                        {doctor.clinicName && (
                          <div className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            <span>{doctor.clinicName}</span>
                          </div>
                        )}
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

        {!loading && doctors.length > 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Showing {doctors.length} doctor{doctors.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  )
}