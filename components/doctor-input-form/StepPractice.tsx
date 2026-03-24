"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, KeyboardEvent } from "react";
import type { DoctorFormData } from "./Doctoronboarding";
import MultiImageUploader from "./MultiImageUploader";

type Props = {
  data: DoctorFormData;
  updateFields: (fields: Partial<DoctorFormData>) => void;
};

export default function StepPractice({ data, updateFields }: Props) {
  const [photoInput, setPhotoInput] = useState("");

  const addClinicPhoto = () => {
    const trimmed = photoInput.trim();
    if (trimmed && !data.clinic_photo_urls.includes(trimmed)) {
      updateFields({ clinic_photo_urls: [...data.clinic_photo_urls, trimmed] });
    }
    setPhotoInput("");
  };

  const removePhoto = (url: string) => {
    updateFields({
      clinic_photo_urls: data.clinic_photo_urls.filter((u) => u !== url),
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addClinicPhoto();
    }
  };

  return (
    <div className="space-y-5">
      {/* Clinic & Hospital */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="clinic_name">Clinic Name</Label>
          <Input
            id="clinic_name"
            placeholder="e.g. HealthFirst Clinic"
            value={data.clinic_name}
            onChange={(e) => updateFields({ clinic_name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hospital">Hospital</Label>
          <Input
            id="hospital"
            placeholder="e.g. City General Hospital"
            value={data.hospital}
            onChange={(e) => updateFields({ hospital: e.target.value })}
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          placeholder="e.g. 123 Main Street"
          value={data.address}
          onChange={(e) => updateFields({ address: e.target.value })}
        />
      </div>

      {/* City / State / ZIP */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Mumbai"
            value={data.city}
            onChange={(e) => updateFields({ city: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="Maharashtra"
            value={data.state}
            onChange={(e) => updateFields({ state: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            placeholder="400001"
            value={data.zip}
            onChange={(e) => updateFields({ zip: e.target.value })}
          />
        </div>
      </div>

      {/* Clinic Photos */}
      <MultiImageUploader
        bucket="doctor-assets"
        folder="clinic-photos"
        values={data.clinic_photo_urls}
        onChange={(urls) => updateFields({ clinic_photo_urls: urls })}
        label="Clinic Photos"
        max={6}
      />
    </div>
  );
}
