"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DoctorFormData } from "./Doctoronboarding";


type Props = {
  data: DoctorFormData;
  updateFields: (fields: Partial<DoctorFormData>) => void;
};

const AVAILABILITY_OPTIONS: { value: DoctorFormData["availability"]; label: string; description: string }[] = [
  { value: "online", label: "Online", description: "Virtual consultations only" },
  { value: "offline", label: "In-Person", description: "Physical visits only" },
  { value: "both", label: "Both", description: "Online & in-person" },
];

export default function StepContact({ data, updateFields }: Props) {
  return (
    <div className="space-y-5">
      {/* Phone & Email */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={data.phone}
            onChange={(e) => updateFields({ phone: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="doctor@example.com"
            value={data.email}
            onChange={(e) => updateFields({ email: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Website */}
      <div className="space-y-1.5">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://yourwebsite.com"
          value={data.website}
          onChange={(e) => updateFields({ website: e.target.value })}
        />
      </div>

      {/* Google Meet */}
      <div className="space-y-1.5">
        <Label htmlFor="google_meet_link">Google Meet Link</Label>
        <Input
          id="google_meet_link"
          type="url"
          placeholder="https://meet.google.com/xxx-xxxx-xxx"
          value={data.google_meet_link}
          onChange={(e) => updateFields({ google_meet_link: e.target.value })}
        />
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <Label>Availability Mode</Label>
        <div className="grid grid-cols-3 gap-3">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFields({ availability: opt.value })}
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-all",
                data.availability === opt.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              <p className={cn(
                "font-medium text-sm",
                data.availability === opt.value ? "text-blue-700" : "text-gray-700"
              )}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}