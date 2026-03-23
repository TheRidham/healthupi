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
    updateFields({ clinic_photo_urls: data.clinic_photo_urls.filter((u) => u !== url) });
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
      <div className="space-y-1.5">
        <Label>Clinic Photo URLs</Label>
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/clinic.jpg"
            value={photoInput}
            onChange={(e) => setPhotoInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" variant="outline" onClick={addClinicPhoto}>
            Add
          </Button>
        </div>
        {data.clinic_photo_urls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.clinic_photo_urls.map((url) => (
              <Badge key={url} variant="secondary" className="flex items-center gap-1 px-3 py-1 max-w-xs truncate">
                <span className="truncate text-xs">{url}</span>
                <X
                  className="w-3 h-3 shrink-0 cursor-pointer hover:text-red-500"
                  onClick={() => removePhoto(url)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}