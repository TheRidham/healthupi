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
    <Card className="mb-6 p-5 sm:p-6 bg-gradient-to-br from-card via-card to-secondary/5 border-border shadow-md">
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Profile Image */}
        <div className="shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 border border-border shadow-sm">
            {doctor.photo_url ? (
              <Image
                src={doctor.photo_url}
                alt={`${doctor.first_name} ${doctor.last_name}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-primary text-2xl font-bold">
                {doctor.first_name?.[0]}
                {doctor.last_name?.[0]}
              </div>
            )}
          </div>
        </div>

        {/* Doctor Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                Dr. {doctor.first_name} {doctor.last_name}
              </h1>
              <p className="text-base text-primary font-semibold mb-2">
                {doctor.designation}
              </p>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg shrink-0">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(doctor.rating || 0)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">
                  {doctor.rating?.toFixed(1) || "N/A"}
                </span>
                <span className="text-[10px] text-muted-foreground ml-1">
                  ({doctor.patients_served || 0})
                </span>
              </div>
            </div>
          </div>

          {/* Specialization & Languages */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-primary/15 text-primary border-primary/30 font-medium text-xs">
              {doctor.specialization}
            </Badge>
            {doctor.sub_specialization && (
              <Badge className="bg-accent/15 text-accent border-accent/30 font-medium text-xs">
                {doctor.sub_specialization}
              </Badge>
            )}
          </div>

          {/* About */}
          {doctor.about && (
            <p className="text-xs text-foreground/70 leading-relaxed max-w-2xl">
              {doctor.about}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
