"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import type { DoctorFormData } from "./Doctoronboarding";


type Props = {
  data: DoctorFormData;
  updateFields: (fields: Partial<DoctorFormData>) => void;
};

export default function StepPersonal({ data, updateFields }: Props) {
  const [langInput, setLangInput] = useState("");

  const addLanguage = () => {
    const trimmed = langInput.trim();
    if (trimmed && !data.languages.includes(trimmed)) {
      updateFields({ languages: [...data.languages, trimmed] });
    }
    setLangInput("");
  };

  const removeLanguage = (lang: string) => {
    updateFields({ languages: data.languages.filter((l) => l !== lang) });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addLanguage();
    }
  };

  return (
    <div className="space-y-5">
      {/* Photo URL */}
      <div className="space-y-1.5">
        <Label htmlFor="photo_url">Profile Photo URL</Label>
        <Input
          id="photo_url"
          placeholder="https://example.com/photo.jpg"
          value={data.photo_url}
          onChange={(e) => updateFields({ photo_url: e.target.value })}
        />
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="first_name"
            placeholder="John"
            value={data.first_name}
            onChange={(e) => updateFields({ first_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            placeholder="Doe"
            value={data.last_name}
            onChange={(e) => updateFields({ last_name: e.target.value })}
          />
        </div>
      </div>

      {/* Designation */}
      <div className="space-y-1.5">
        <Label htmlFor="designation">Designation</Label>
        <Input
          id="designation"
          placeholder="e.g. Senior Consultant, HOD"
          value={data.designation}
          onChange={(e) => updateFields({ designation: e.target.value })}
        />
      </div>

      {/* About */}
      <div className="space-y-1.5">
        <Label htmlFor="about">About</Label>
        <Textarea
          id="about"
          placeholder="Brief bio about yourself..."
          rows={4}
          value={data.about}
          onChange={(e) => updateFields({ about: e.target.value })}
          className="resize-none"
        />
      </div>

      {/* Languages */}
      <div className="space-y-1.5">
        <Label>Languages Spoken</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. English"
            value={langInput}
            onChange={(e) => setLangInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" variant="outline" onClick={addLanguage}>
            Add
          </Button>
        </div>
        {data.languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                {lang}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeLanguage(lang)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}