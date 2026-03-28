"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertCircle,
  Loader2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type PatientProfile = {
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

interface ProfileTabProps {
  onEditClick: () => void;
}

export default function ProfileTab({ onEditClick }: ProfileTabProps) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/patient/profile`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProfile(res.data);
        else setError(res.error ?? "Failed to load profile");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-gray-500">No profile data found</div>
    );
  }

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    const age =
      today.getFullYear() -
      birthDate.getFullYear() -
      (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate())
        ? 1
        : 0);
    return age;
  };

  const age = calculateAge(profile.date_of_birth);

  return (
    <div className="space-y-6">
      {/* Header with Profile Picture and Edit Button */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Profile Picture */}
          <div className="relative">
            {profile.photo_url ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={profile.photo_url}
                  alt={profile.name || "Profile"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">
                  {profile.name?.charAt(0).toUpperCase() || "P"}
                </span>
              </div>
            )}
          </div>

          {/* Patient Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Patient ID: {profile.id}</p>
          </div>
        </div>
        <Button
          onClick={onEditClick}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      {/* Basic Info Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {age && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="text-gray-900 font-medium">{age} years</p>
              </div>
            </div>
          )}

          {profile.gender && (
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                {profile.gender}
              </Badge>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
              </div>
            </div>
          )}

          {profile.blood_group && (
            <div className="flex items-start gap-3">
              <Droplet className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="text-gray-900 font-medium">{profile.blood_group}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>

        <div className="space-y-4">
          {profile.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{profile.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{profile.email}</p>
            </div>
          </div>

          {(profile.address || profile.city || profile.state) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-900">
                  {[profile.address, profile.city, profile.state, profile.zip]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medical Information */}
      {(profile.allergies || profile.medical_conditions) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Medical Information
          </h3>

          <div className="space-y-4">
            {profile.allergies && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Allergies</p>
                <p className="text-gray-900">{profile.allergies}</p>
              </div>
            )}

            {profile.medical_conditions && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Medical Conditions</p>
                <p className="text-gray-900">{profile.medical_conditions}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
