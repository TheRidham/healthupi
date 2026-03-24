"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Video,
  Award,
  Building2,
  Clock,
  Users,
  Star,
  Pencil,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

type Profile = {
  id: string;
  first_name: string;
  last_name: string | null;
  designation: string | null;
  about: string | null;
  specialization: string | null;
  sub_specialization: string | null;
  experience_years: number | null;
  qualifications: string[] | null;
  registration_no: string | null;
  clinic_name: string | null;
  hospital: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  google_meet_link: string | null;
  languages: string[] | null;
  availability: string;
  patients_served: number | null;
  rating: number | null;
  photo_url: string | null;
  clinic_photo_urls: string[];
};

export default function ProfileTab() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingMeet, setIsEditingMeet] = useState(false);
  const [meetLinkInput, setMeetLinkInput] = useState("");
  const [meetSaving, setMeetSaving] = useState(false);
  const [meetError, setMeetError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/profile")
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

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-gray-500">{error ?? "Profile not found"}</p>
        <Button variant="outline" asChild>
          <Link href="/doctor/onboarding">Complete your profile</Link>
        </Button>
      </div>
    );
  }

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ");
  const location = [profile.city, profile.state].filter(Boolean).join(", ");

  const startEditMeet = () => {
    setMeetLinkInput(profile.google_meet_link ?? "");
    setMeetError(null);
    setIsEditingMeet(true);
  };

  const cancelEditMeet = () => {
    setIsEditingMeet(false);
    setMeetError(null);
    setMeetLinkInput(profile.google_meet_link ?? "");
  };

  const handleSaveMeetLink = async () => {
    setMeetSaving(true);
    setMeetError(null);
    const cleanedLink = meetLinkInput.trim();

    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_meet_link: cleanedLink || null,
        }),
      });
      const { success, data, error: updateError } = await res.json();

      if (!res.ok || !success) {
        throw new Error(updateError ?? "Failed to update Google Meet link");
      }

      setProfile((prev) => {
        if (!prev) return prev;
        if (data && typeof data === "object") {
          return { ...prev, ...data };
        }
        return { ...prev, google_meet_link: cleanedLink || null };
      });
      setIsEditingMeet(false);
    } catch (err) {
      setMeetError(
        err instanceof Error ? err.message : "Failed to update Google Meet link"
      );
    } finally {
      setMeetSaving(false);
    }
  };

  const availabilityLabel: Record<string, { label: string; color: string }> = {
    online: { label: "Online", color: "bg-green-100 text-green-700" },
    offline: { label: "In-Person", color: "bg-blue-100 text-blue-700" },
    both: {
      label: "Online & In-Person",
      color: "bg-purple-100 text-purple-700",
    },
  };
  const avail = availabilityLabel[profile.availability] ?? {
    label: profile.availability,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
            {profile.photo_url ? (
              <Image
                src={profile.photo_url}
                alt={fullName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300">
                {profile.first_name[0]}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {fullName}
                </h2>
                {profile.designation && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {profile.designation}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.specialization && (
                    <Badge className="bg-blue-50 text-blue-700 border-none text-xs">
                      {profile.specialization}
                    </Badge>
                  )}
                  {profile.sub_specialization && (
                    <Badge variant="outline" className="text-xs">
                      {profile.sub_specialization}
                    </Badge>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${avail.color}`}
                  >
                    {avail.label}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                asChild
              >
                <Link href="/doctor/onboarding">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-gray-100">
              {profile.experience_years != null && (
                <Stat
                  icon={<Clock className="w-4 h-4" />}
                  label="Experience"
                  value={`${profile.experience_years} yrs`}
                />
              )}
              {profile.patients_served != null && (
                <Stat
                  icon={<Users className="w-4 h-4" />}
                  label="Patients"
                  value={profile.patients_served.toString()}
                />
              )}
              {profile.rating != null && (
                <Stat
                  icon={<Star className="w-4 h-4" />}
                  label="Rating"
                  value={`${profile.rating} / 5`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Google Meet Highlight ────────────────────────────────────────── */}
      {isEditingMeet ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Update Google Meet link</p>
              <p className="text-xs text-blue-600">Paste a valid meeting URL for online consultations</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={meetLinkInput}
              onChange={(e) => setMeetLinkInput(e.target.value)}
              placeholder="https://meet.google.com/xxx"
              className="bg-white"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={cancelEditMeet}
                disabled={meetSaving}
              >
                Cancel
              </Button>
              <Button size="sm" className="gap-1.5" onClick={handleSaveMeetLink} disabled={meetSaving}>
                {meetSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>

          {meetError ? <p className="text-xs text-red-600">{meetError}</p> : null}
        </div>
      ) : profile.google_meet_link ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-900">Google Meet ready</p>
              <p className="text-xs text-blue-600 truncate max-w-xs">{profile.google_meet_link}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={startEditMeet}>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 gap-1.5"
              asChild
            >
              <a
                href={profile.google_meet_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">No Google Meet link</p>
              <p className="text-xs text-gray-400">
                Add one so patients can join online consultations
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={startEditMeet}>
            <Pencil className="w-3.5 h-3.5" /> Add Link
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* About */}
        {profile.about && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 md:col-span-2">
            <SectionTitle>About</SectionTitle>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              {profile.about}
            </p>
          </div>
        )}

        {/* Credentials */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionTitle>Credentials</SectionTitle>
          <div className="mt-3 space-y-3">
            {profile.qualifications?.length ? (
              <InfoRow
                icon={<Award className="w-4 h-4" />}
                label="Qualifications"
              >
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {profile.qualifications.map((q) => (
                    <Badge key={q} variant="secondary" className="text-xs">
                      {q}
                    </Badge>
                  ))}
                </div>
              </InfoRow>
            ) : null}
            {profile.registration_no && (
              <InfoRow
                icon={<Award className="w-4 h-4" />}
                label="Registration No."
              >
                <span className="text-sm text-gray-700">
                  {profile.registration_no}
                </span>
              </InfoRow>
            )}
            {profile.languages?.length ? (
              <InfoRow icon={<Globe className="w-4 h-4" />} label="Languages">
                <span className="text-sm text-gray-700">
                  {profile.languages.join(", ")}
                </span>
              </InfoRow>
            ) : null}
          </div>
        </div>

        {/* Practice */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionTitle>Practice</SectionTitle>
          <div className="mt-3 space-y-3">
            {profile.clinic_name && (
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="Clinic">
                <span className="text-sm text-gray-700">
                  {profile.clinic_name}
                </span>
              </InfoRow>
            )}
            {profile.hospital && (
              <InfoRow
                icon={<Building2 className="w-4 h-4" />}
                label="Hospital"
              >
                <span className="text-sm text-gray-700">
                  {profile.hospital}
                </span>
              </InfoRow>
            )}
            {location && (
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location">
                <span className="text-sm text-gray-700">
                  {[profile.address, location, profile.zip]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </InfoRow>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionTitle>Contact</SectionTitle>
          <div className="mt-3 space-y-3">
            {profile.phone && (
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone">
                <span className="text-sm text-gray-700">{profile.phone}</span>
              </InfoRow>
            )}
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email">
              <span className="text-sm text-gray-700">{profile.email}</span>
            </InfoRow>
            {profile.website && (
              <InfoRow icon={<Globe className="w-4 h-4" />} label="Website">
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate"
                >
                  {profile.website}
                </a>
              </InfoRow>
            )}
            {profile.google_meet_link && (
              <InfoRow icon={<Video className="w-4 h-4" />} label="Google Meet">
                <a
                  href={profile.google_meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate"
                >
                  {profile.google_meet_link}
                </a>
              </InfoRow>
            )}
          </div>
        </div>

        {/* Clinic Photos */}
        {profile.clinic_photo_urls?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <SectionTitle>Clinic Photos</SectionTitle>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {profile.clinic_photo_urls.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-video rounded-lg overflow-hidden border border-gray-200"
                >
                  <Image
                    src={url}
                    alt={`Clinic ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-900">{children}</h3>;
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        {children}
      </div>
    </div>
  );
}
