"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, CheckCircle, X } from "lucide-react";

type PatientProfile = {
  id: string;
  user_id: string;
  name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  phone: string | null;
  email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  allergies: string | null;
  medical_conditions: string | null;
  photo_url: string | null;
};

const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const GENDERS = ["Male", "Female", "Other"];
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

interface ProfileEditTabProps {
  profile: PatientProfile | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProfileEditTab({
  profile,
  onSaved,
  onCancel,
}: ProfileEditTabProps) {
  const [formData, setFormData] = useState<PatientProfile | null>(profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (
    field: keyof PatientProfile,
    value: string | null
  ) => {
    if (formData) {
      setFormData({ ...formData, [field]: value || null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/patient/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSaved();
        }, 2000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-green-800 text-sm">Profile updated successfully!</div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter your full name"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="dob" className="text-gray-700">
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={formData.date_of_birth || ""}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="gender" className="text-gray-700">
              Gender
            </Label>
            <Select
              value={formData.gender || ""}
              onValueChange={(value) => handleChange("gender", value)}
            >
              <SelectTrigger id="gender" className="mt-1.5">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="blood" className="text-gray-700">
              Blood Group
            </Label>
            <Select
              value={formData.blood_group || ""}
              onValueChange={(value) => handleChange("blood_group", value)}
            >
              <SelectTrigger id="blood" className="mt-1.5">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="text-gray-700">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              disabled
              className="mt-1.5 bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              onChange={(e) => handleChange("email", e.target.value)}
              value={formData.email}
              className="mt-1.5"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address" className="text-gray-700">
              Address
            </Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Street address"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="city" className="text-gray-700">
              City
            </Label>
            <Input
              id="city"
              value={formData.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="City"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="state" className="text-gray-700">
              State
            </Label>
            <Select
              value={formData.state || ""}
              onValueChange={(value) => handleChange("state", value)}
            >
              <SelectTrigger id="state" className="mt-1.5">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="zip" className="text-gray-700">
              ZIP Code
            </Label>
            <Input
              id="zip"
              value={formData.zip || ""}
              onChange={(e) => handleChange("zip", e.target.value)}
              placeholder="PIN code"
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Medical Information
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="allergies" className="text-gray-700">
              Allergies
            </Label>
            <Input
              id="allergies"
              value={formData.allergies || ""}
              onChange={(e) => handleChange("allergies", e.target.value)}
              placeholder="List any allergies (e.g., Penicillin, Nuts, etc.)"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="medical" className="text-gray-700">
              Medical Conditions
            </Label>
            <Input
              id="medical"
              value={formData.medical_conditions || ""}
              onChange={(e) =>
                handleChange("medical_conditions", e.target.value)
              }
              placeholder="List any medical conditions (e.g., Diabetes, Asthma, etc.)"
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
