import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Award, Users, BookOpen } from "lucide-react";
import { DoctorProfile } from "@/types/doctor";

interface ProfessionalInfoProps {
  doctor: DoctorProfile;
}

export default function ProfessionalInfo({ doctor }: ProfessionalInfoProps) {
  return (
    <Card className="p-5 sm:p-6 bg-gradient-to-br from-card via-card to-primary/5 border-border shadow-md">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Award className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Professional Info</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Experience</p>
          <p className="text-lg font-bold text-foreground flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            {doctor.experience_years || 0}
            <span className="text-xs text-muted-foreground font-normal">Years</span>
          </p>
        </div>

        {doctor.designation && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Designation</p>
            <p className="text-xs font-semibold text-foreground bg-secondary/30 px-2.5 py-1.5 rounded-md">
              {doctor.designation}
            </p>
          </div>
        )}

        {doctor.specialization && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Specialization</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge className="bg-primary text-primary-foreground font-medium text-[10px]">
                {doctor.specialization}
              </Badge>
              {doctor.sub_specialization && (
                <Badge className="bg-accent/15 text-accent border-accent/30 font-medium text-[10px]">
                  {doctor.sub_specialization}
                </Badge>
              )}
            </div>
          </div>
        )}

        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              Qualifications
            </p>
            <ul className="space-y-1">
              {doctor.qualifications.map((qual, idx) => (
                <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">✓</span>
                  {qual}
                </li>
              ))}
            </ul>
          </div>
        )}

        {doctor.languages && doctor.languages.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {doctor.languages.map((lang) => (
                <Badge key={lang} className="bg-secondary text-foreground border-border font-medium text-[10px]">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Patients Served</p>
          <Badge className="bg-accent/15 text-accent border-accent/30 font-bold text-xs px-2.5 py-1">
            {doctor.patients_served}+
          </Badge>
        </div>
      </div>
    </Card>
  );
}
