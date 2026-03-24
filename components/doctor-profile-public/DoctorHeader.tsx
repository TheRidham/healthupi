import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { DoctorProfile } from "@/types/doctor";

interface DoctorHeaderProps {
  doctor: DoctorProfile;
}

export default function DoctorHeader({ doctor }: DoctorHeaderProps) {
  return (
    <Card className="mb-8 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Profile Image */}
        <div className="shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-secondary/20">
            {doctor.photo_url ? (
              <Image
                src={doctor.photo_url}
                alt={`${doctor.first_name} ${doctor.last_name}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/40 to-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {doctor.first_name?.[0]}
                {doctor.last_name?.[0]}
              </div>
            )}
          </div>
        </div>

        {/* Doctor Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                Dr. {doctor.first_name} {doctor.last_name}
              </h1>
              <p className="text-lg text-primary font-semibold mb-3">
                {doctor.designation}
              </p>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(doctor.rating || 0)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-foreground/70">
                {doctor.rating?.toFixed(1) || "N/A"} ({doctor.patients_served || 0})
              </span>
            </div>
          </div>

          {/* Specialization & Languages */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
              {doctor.specialization}
            </Badge>
            {doctor.sub_specialization && (
              <Badge variant="secondary">
                {doctor.sub_specialization}
              </Badge>
            )}
          </div>

          {/* About */}
          {doctor.about && (
            <p className="text-sm text-foreground/70 leading-relaxed">
              {doctor.about}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
