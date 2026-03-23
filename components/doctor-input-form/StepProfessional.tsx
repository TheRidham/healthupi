"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import type { DoctorFormData } from "./Doctoronboarding";

type Props = {
  data: DoctorFormData;
  updateFields: (fields: Partial<DoctorFormData>) => void;
};

export default function StepProfessional({ data, updateFields }: Props) {
  const [qualInput, setQualInput] = useState("");

  const addQualification = () => {
    const trimmed = qualInput.trim();
    if (trimmed && !data.qualifications.includes(trimmed)) {
      updateFields({ qualifications: [...data.qualifications, trimmed] });
    }
    setQualInput("");
  };

  const removeQualification = (q: string) => {
    updateFields({ qualifications: data.qualifications.filter((x) => x !== q) });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addQualification();
    }
  };

  return (
    <div className="space-y-5">
      {/* Specialization */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            placeholder="e.g. Cardiology"
            value={data.specialization}
            onChange={(e) => updateFields({ specialization: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub_specialization">Sub-Specialization</Label>
          <Input
            id="sub_specialization"
            placeholder="e.g. Interventional"
            value={data.sub_specialization}
            onChange={(e) => updateFields({ sub_specialization: e.target.value })}
          />
        </div>
      </div>

      {/* Experience & Registration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="experience_years">Years of Experience</Label>
          <Input
            id="experience_years"
            type="number"
            min={0}
            placeholder="e.g. 10"
            value={data.experience_years}
            onChange={(e) =>
              updateFields({
                experience_years: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="registration_no">Registration No.</Label>
          <Input
            id="registration_no"
            placeholder="e.g. MCI-12345"
            value={data.registration_no}
            onChange={(e) => updateFields({ registration_no: e.target.value })}
          />
        </div>
      </div>

      {/* Qualifications */}
      <div className="space-y-1.5">
        <Label>Qualifications</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. MBBS, MD, DNB"
            value={qualInput}
            onChange={(e) => setQualInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" variant="outline" onClick={addQualification}>
            Add
          </Button>
        </div>
        {data.qualifications.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.qualifications.map((q) => (
              <Badge key={q} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                {q}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeQualification(q)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}