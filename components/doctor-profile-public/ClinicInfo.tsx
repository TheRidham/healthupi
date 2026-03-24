import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { DoctorProfile } from "@/types/doctor";

interface ClinicInfoProps {
  doctor: DoctorProfile;
}

export default function ClinicInfo({ doctor }: ClinicInfoProps) {
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-secondary/30">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Clinic Information</h3>
      </div>

      <div className="space-y-5">
        {doctor.clinic_name && (
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">Clinic Name</p>
            <p className="font-semibold text-foreground text-lg">
              {doctor.clinic_name}
            </p>
          </div>
        )}

        {doctor.hospital && (
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">Hospital</p>
            <p className="font-semibold text-foreground">
              {doctor.hospital}
            </p>
          </div>
        )}

        {(doctor.address || doctor.city || doctor.state) && (
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">Location</p>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {[doctor.address, doctor.city, doctor.state]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-secondary/30">
          <p className="text-xs text-foreground/50 uppercase tracking-wide mb-3">Get in Touch</p>
          <div className="space-y-3">
            {doctor.phone && (
              <a
                href={`tel:${doctor.phone}`}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition group"
              >
                <span className="text-sm flex items-center gap-2 text-foreground/70">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone
                </span>
                <span className="font-semibold text-primary group-hover:underline">
                  {doctor.phone}
                </span>
              </a>
            )}

            {doctor.email && (
              <a
                href={`mailto:${doctor.email}`}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition group"
              >
                <span className="text-sm flex items-center gap-2 text-foreground/70">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </span>
                <span className="font-semibold text-primary group-hover:underline truncate text-sm">
                  {doctor.email}
                </span>
              </a>
            )}

            {doctor.website && (
              <a
                href={doctor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition group"
              >
                <span className="text-sm flex items-center gap-2 text-foreground/70">
                  <Globe className="w-4 h-4 text-primary" />
                  Website
                </span>
                <span className="font-semibold text-primary group-hover:underline">
                  Visit
                </span>
              </a>
            )}
          </div>
        </div>

        {doctor.availability && (
          <div className="pt-2 border-t border-secondary/30">
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">Availability</p>
            <Badge
              className={`${
                doctor.availability === "online" || doctor.availability === "both"
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary/40"
              }`}
            >
              {doctor.availability === "online"
                ? "🌐 Online"
                : doctor.availability === "both"
                  ? "🌐 Online & Offline"
                  : "🏥 Offline Only"}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
