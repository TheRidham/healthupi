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
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-secondary/30">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Professional</h3>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">Experience</p>
          <p className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {doctor.experience_years || 0} Years
          </p>
        </div>

        {doctor.designation && (
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">Designation</p>
            <p className="font-semibold text-foreground">
              {doctor.designation}
            </p>
          </div>
        )}

        {doctor.specialization && (
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">Specialization</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-primary">
                {doctor.specialization}
              </Badge>
              {doctor.sub_specialization && (
                <Badge className="bg-primary/20 text-primary">
                  {doctor.sub_specialization}
                </Badge>
              )}
            </div>
          </div>
        )}

        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-3 flex items-center gap-2">
              <BookOpen className="w-3 h-3" />
              Qualifications
            </p>
            <ul className="space-y-2">
              {doctor.qualifications.map((qual, idx) => (
                <li key={idx} className="text-sm font-medium text-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {qual}
                </li>
              ))}
            </ul>
          </div>
        )}

        {doctor.languages && doctor.languages.length > 0 && (
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">Languages</p>
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="text-foreground">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {doctor.patients_served && (
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">Patients Served</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-foreground">
                {doctor.patients_served}+
              </Badge>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
