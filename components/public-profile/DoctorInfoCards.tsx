import {
  GraduationCap,
  ShieldCheck,
  Users,
  Building2,
  MapPin,
  Phone,
  Globe,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DoctorData } from "@/types/doctor-profile";

interface DoctorInfoCardsProps {
  doctor: Partial<DoctorData> & {
    experience: string;
    registrationNumber: string;
    patientsServed: string;
    languages: string[];
    clinicName: string;
    address: string;
  };
}

export function DoctorInfoCards({ doctor }: DoctorInfoCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Professional */}
      <Card className="py-4">
        <CardHeader className="px-5 py-0 pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Stethoscope className="size-4 text-primary" />
            Professional
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-0">
          <div className="flex flex-col gap-2.5">
            <InfoRow icon={<GraduationCap className="size-3.5" />} label="Experience" value={doctor.experience} />
            <InfoRow icon={<ShieldCheck className="size-3.5" />} label="Registration" value={doctor.registrationNumber} />
            <InfoRow icon={<Users className="size-3.5" />} label="Patients" value={doctor.patientsServed} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Languages</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {doctor.languages.map((l) => (
                  <Badge key={l} variant="outline" className="text-[10px] px-1.5">
                    {l}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinic */}
      <Card className="py-4">
        <CardHeader className="px-5 py-0 pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Clinic
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-0">
          <div className="flex flex-col gap-2.5">
            <InfoRow icon={<Building2 className="size-3.5" />} label="Clinic" value={doctor.clinicName} />
            {doctor.hospital && (
              <InfoRow icon={<Building2 className="size-3.5" />} label="Hospital" value={doctor.hospital} />
            )}
            <InfoRow icon={<MapPin className="size-3.5" />} label="Address" value={doctor.address} />
            {doctor.phone && (
              <InfoRow icon={<Phone className="size-3.5" />} label="Phone" value={doctor.phone} />
            )}
            {doctor.website && (
              <InfoRow icon={<Globe className="size-3.5" />} label="Website" value={doctor.website} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Reusable row ─────────────────────────────────────────────────

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs text-foreground font-medium text-right truncate max-w-[200px]">
        {value}
      </span>
    </div>
  );
}