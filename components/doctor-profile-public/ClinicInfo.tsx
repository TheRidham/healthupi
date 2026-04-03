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
    <Card className="p-5 sm:p-6 bg-gradient-to-br from-card via-card to-accent/5 border-border shadow-md">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
        <div className="p-1.5 bg-accent/10 rounded-lg">
          <MapPin className="w-4 h-4 text-accent" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Clinic Information</h3>
      </div>

      <div className="space-y-4">
        {doctor.clinic_name && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Clinic Name</p>
            <p className="font-semibold text-foreground text-base bg-secondary/30 px-2.5 py-1.5 rounded-md">
              {doctor.clinic_name}
            </p>
          </div>
        )}

        {doctor.hospital && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Hospital</p>
            <p className="font-semibold text-foreground bg-secondary/30 px-2.5 py-1.5 rounded-md text-sm">
              {doctor.hospital}
            </p>
          </div>
        )}

        {(doctor.address || doctor.city || doctor.state) && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Location</p>
            <div className="flex items-start gap-2 bg-secondary/20 p-2.5 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-foreground leading-relaxed">
                {[doctor.address, doctor.city, doctor.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2.5">Get in Touch</p>
          <div className="space-y-2">
            {doctor.phone && (
              <a
                href={`tel:${doctor.phone}`}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition group border border-primary/20"
              >
                <span className="text-xs flex items-center gap-1.5 text-foreground/70">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  Phone
                </span>
                <span className="font-semibold text-primary group-hover:underline text-xs">
                  {doctor.phone}
                </span>
              </a>
            )}

            {doctor.email && (
              <a
                href={`mailto:${doctor.email}`}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-accent/10 hover:bg-accent/20 transition group border border-accent/20"
              >
                <span className="text-xs flex items-center gap-1.5 text-foreground/70">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  Email
                </span>
                <span className="font-semibold text-accent group-hover:underline truncate text-xs">
                  {doctor.email}
                </span>
              </a>
            )}

            {doctor.website && (
              <a
                href={doctor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition group border border-border"
              >
                <span className="text-xs flex items-center gap-1.5 text-foreground/70">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  Website
                </span>
                <span className="font-semibold text-foreground group-hover:underline text-xs">
                  Visit
                </span>
              </a>
            )}
          </div>
        </div>

        {doctor.availability && (
          <div className="pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Availability</p>
            <Badge
              className={`font-medium text-[10px] py-1.5 px-2.5 ${
                doctor.availability === "online" || doctor.availability === "both"
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-secondary/50 text-foreground border-border"
              }`}
            >
              {doctor.availability === "online"
                ? "🌐 Online Only"
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
