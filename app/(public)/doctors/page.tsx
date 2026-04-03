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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">

      <div className="border-b border-border bg-gradient-to-r from-primary/5 via-card to-accent/5 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-foreground mb-1">Find a Doctor</h1>
          <p className="text-sm text-muted-foreground">
            Browse and book appointments with our verified doctors
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : doctors.length === 0 ? (
          <Card className="py-12 border-border bg-card">
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
                className="cursor-pointer border-border hover:shadow-lg hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 bg-card hover:bg-card/80 dark:hover:bg-card/60"
                onClick={() => router.push(`/doctors/${doctor.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative size-20 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm">
                      <Image
                        src={doctor.avatar}
                        alt={doctor.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-foreground">
                              {doctor.name}
                            </h3>
                            {doctor.available && (
                              <Badge className="bg-gradient-to-r from-accent to-purple-600 text-accent-foreground border-none text-xs font-medium">
                                <span className="size-2 rounded-full bg-accent-foreground/90 mr-2 animate-pulse" />
                                Available
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {doctor.title} • {doctor.experience}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-medium">
                              {doctor.specialization}
                            </Badge>
                            {doctor.subSpecialization && (
                              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                                {doctor.subSpecialization}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {doctor.rating > 0 && (
                          <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded-lg shrink-0">
                            <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
                            <div>
                              <span className="text-xs font-bold text-foreground">{doctor.rating}</span>
                              <span className="text-[10px] text-muted-foreground ml-0.5">
                                ({doctor.reviewCount})
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                        {doctor.location && (
                          <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <MapPin className="size-3.5 text-primary/60" />
                            <span>{doctor.location}</span>
                          </div>
                        )}
                        {doctor.clinicName && (
                          <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <Clock className="size-3.5 text-primary/60" />
                            <span>{doctor.clinicName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button className="shrink-0 gap-1.5 h-9 text-sm bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 text-primary-foreground font-medium shadow-sm" asChild>
                      <span>
                        View
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
          <p className="mt-6 text-center text-xs text-muted-foreground font-medium">
            Showing {doctors.length} doctor{doctors.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  )
}