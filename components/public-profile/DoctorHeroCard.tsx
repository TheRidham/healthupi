import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DoctorData } from "@/types/doctor-profile";
import { FALLBACK_DOCTOR } from "@/constants/doctor-profile";

type Doctor = Partial<DoctorData> & {
  name: string;
  avatar: string;
  title: string;
  specialization: string;
  subSpecialization: string;
  qualifications: string[];
  rating: number;
  reviewCount: number;
  bio: string;
};

interface DoctorHeroCardProps {
  doctor: Doctor;
}

export function DoctorHeroCard({ doctor }: DoctorHeroCardProps) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="absolute -bottom-8 left-6">
          <div className="relative size-16 rounded-2xl overflow-hidden border-4 border-card shadow-md">
            <Image
              src={doctor.avatar || FALLBACK_DOCTOR.avatar!}
              alt={`${doctor.name} photo`}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        </div>
      </div>

      <CardContent className="pt-11 pb-4 px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{doctor.name}</h1>
            <p className="text-xs text-muted-foreground">{doctor.title}</p>

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-none text-[10px]">
                {doctor.specialization}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {doctor.subSpecialization}
              </Badge>
              {doctor.qualifications.slice(0, 2).map((q) => (
                <Badge key={q} variant="secondary" className="text-[9px]">
                  {q}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2 sm:mt-0 shrink-0">
            <Star className="size-3.5 fill-chart-4 text-chart-4" />
            <span className="text-sm font-semibold text-foreground">{doctor.rating}</span>
            <span className="text-[10px] text-muted-foreground">({doctor.reviewCount})</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">
          {doctor.bio}
        </p>
      </CardContent>
    </Card>
  );
}