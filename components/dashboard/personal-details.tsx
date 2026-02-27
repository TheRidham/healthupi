"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MapPin,
  Stethoscope,
  GraduationCap,
  Building2,
  Calendar,
  Mail,
  Phone,
  Globe,
  Award,
  Edit3,
  Save,
  X,
  ImagePlus,
} from "lucide-react"

interface DoctorInfo {
  name: string
  title: string
  specialization: string
  subSpecialization: string
  experience: string
  qualifications: string[]
  registrationNumber: string
  clinicName: string
  hospitalAffiliation: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website: string
  bio: string
  languages: string[]
  consultationFee: string
}

const INITIAL_DATA: DoctorInfo = {
  name: "Dr. Rahul Sharma",
  title: "Senior Consultant",
  specialization: "Internal Medicine",
  subSpecialization: "Cardiology",
  experience: "15 years",
  qualifications: ["MD", "MBBS", "FACC", "Board Certified"],
  registrationNumber: "MCI-2011-48293",
  clinicName: "Sharma Cardiology Center",
  hospitalAffiliation: "Apollo Hospital",
  address: "1234 Medical Plaza, Suite 200",
  city: "New Delhi",
  state: "Delhi",
  zipCode: "110001",
  phone: "+91 98765 43210",
  email: "dr.rahul@healthupi.com",
  website: "www.sharmaCardiology.com",
  bio: "Experienced cardiologist with over 15 years of practice in interventional cardiology and preventive heart care. Passionate about leveraging telemedicine to improve patient access to quality healthcare. Published over 30 research papers in leading medical journals.",
  languages: ["English", "Hindi", "Tamil"],
  consultationFee: "500",
}

const GALLERY_IMAGES = [
  { src: "/images/clinic-1.jpg", alt: "Examination room" },
  { src: "/images/clinic-2.jpg", alt: "Reception area" },
  { src: "/images/clinic-3.jpg", alt: "Consultation office" },
]

export function PersonalDetails() {
  const [isEditing, setIsEditing] = useState(false)
  const [info, setInfo] = useState<DoctorInfo>(INITIAL_DATA)
  const [editInfo, setEditInfo] = useState<DoctorInfo>(INITIAL_DATA)

  const startEditing = () => {
    setEditInfo({ ...info })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveChanges = () => {
    setInfo({ ...editInfo })
    setIsEditing(false)
  }

  const updateField = (field: keyof DoctorInfo, value: string) => {
    setEditInfo((prev) => ({ ...prev, [field]: value }))
  }

  const currentData = isEditing ? editInfo : info

  return (
    <div className="flex flex-col gap-6">
      {/* Header with photo and name */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-border shadow-sm">
            <Image
              src="/images/doctor-avatar.jpg"
              alt="Doctor profile photo"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            {isEditing ? (
              <div className="flex flex-col gap-1">
                <Label htmlFor="doctor-name" className="sr-only">
                  Doctor name
                </Label>
                <Input
                  id="doctor-name"
                  value={editInfo.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="text-xl font-semibold h-9"
                />
              </div>
            ) : (
              <h2 className="text-xl font-semibold text-foreground">
                {info.name}
              </h2>
            )}
            <p className="text-sm text-muted-foreground">{info.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-primary/10 text-primary border-none text-[11px]">
                {info.specialization}
              </Badge>
              <Badge variant="outline" className="text-[11px]">
                {info.subSpecialization}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="size-3.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={saveChanges}>
                <Save className="size-3.5" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Edit3 className="size-3.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Bio */}
      <div>
        <Label htmlFor="doctor-bio" className="text-sm font-semibold text-foreground mb-2">
          About
        </Label>
        {isEditing ? (
          <Textarea
            id="doctor-bio"
            value={editInfo.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            rows={3}
            className="text-sm"
          />
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {info.bio}
          </p>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Professional Info */}
        <Card className="py-4">
          <CardHeader className="px-5 py-0 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Stethoscope className="size-4 text-primary" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-0">
            <div className="flex flex-col gap-3">
              <InfoRow
                label="Specialization"
                fieldId="specialization"
                value={currentData.specialization}
                isEditing={isEditing}
                onChange={(v) => updateField("specialization", v)}
              />
              <InfoRow
                label="Sub-specialization"
                fieldId="sub-specialization"
                value={currentData.subSpecialization}
                isEditing={isEditing}
                onChange={(v) => updateField("subSpecialization", v)}
              />
              <InfoRow
                label="Experience"
                fieldId="experience"
                value={currentData.experience}
                isEditing={isEditing}
                onChange={(v) => updateField("experience", v)}
              />
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
                  Qualifications
                </span>
                <div className="flex flex-wrap justify-end gap-1">
                  {info.qualifications.map((q) => (
                    <Badge
                      key={q}
                      variant="secondary"
                      className="text-[10px] px-1.5"
                    >
                      {q}
                    </Badge>
                  ))}
                </div>
              </div>
              <InfoRow
                label="Registration No."
                fieldId="registration-no"
                value={currentData.registrationNumber}
                isEditing={isEditing}
                onChange={(v) => updateField("registrationNumber", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinic Info */}
        <Card className="py-4">
          <CardHeader className="px-5 py-0 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Clinic / Hospital
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-0">
            <div className="flex flex-col gap-3">
              <InfoRow
                label="Clinic Name"
                fieldId="clinic-name"
                value={currentData.clinicName}
                isEditing={isEditing}
                onChange={(v) => updateField("clinicName", v)}
              />
              <InfoRow
                label="Hospital"
                fieldId="hospital"
                value={currentData.hospitalAffiliation}
                isEditing={isEditing}
                onChange={(v) => updateField("hospitalAffiliation", v)}
              />
              <InfoRow
                label="Address"
                fieldId="address"
                value={currentData.address}
                isEditing={isEditing}
                onChange={(v) => updateField("address", v)}
              />
              <InfoRow
                label="City"
                fieldId="city"
                value={currentData.city}
                isEditing={isEditing}
                onChange={(v) => updateField("city", v)}
              />
              <InfoRow
                label="State / Zip"
                fieldId="state"
                value={`${currentData.state}, ${currentData.zipCode}`}
                isEditing={isEditing}
                onChange={(v) => updateField("state", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="py-4">
          <CardHeader className="px-5 py-0 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-0">
            <div className="flex flex-col gap-3">
              <InfoRow
                label="Phone"
                fieldId="phone"
                value={currentData.phone}
                isEditing={isEditing}
                onChange={(v) => updateField("phone", v)}
                icon={<Phone className="size-3 text-muted-foreground" />}
              />
              <InfoRow
                label="Email"
                fieldId="email"
                value={currentData.email}
                isEditing={isEditing}
                onChange={(v) => updateField("email", v)}
                icon={<Mail className="size-3 text-muted-foreground" />}
              />
              <InfoRow
                label="Website"
                fieldId="website"
                value={currentData.website}
                isEditing={isEditing}
                onChange={(v) => updateField("website", v)}
                icon={<Globe className="size-3 text-muted-foreground" />}
              />
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
                  Languages
                </span>
                <div className="flex flex-wrap justify-end gap-1">
                  {info.languages.map((l) => (
                    <Badge
                      key={l}
                      variant="outline"
                      className="text-[10px] px-1.5"
                    >
                      {l}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="py-4">
          <CardHeader className="px-5 py-0 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="size-4 text-primary" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-0">
            <div className="flex flex-col gap-3">
              <InfoRow
                label="Base Fee"
                fieldId="base-fee"
                value={`$${currentData.consultationFee}`}
                isEditing={isEditing}
                onChange={(v) => updateField("consultationFee", v)}
              />
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                  Availability
                </span>
                <Badge className="bg-accent text-accent-foreground text-[10px] border-none">
                  Online Now
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                  Member Since
                </span>
                <div className="flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span className="text-xs text-foreground font-medium">
                    Jan 2020
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                  Patients Served
                </span>
                <span className="text-xs text-foreground font-medium">
                  3,200+
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                  Rating
                </span>
                <span className="text-xs text-foreground font-medium">
                  4.9 / 5.0
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-semibold text-foreground">
            Photos & Gallery
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <ImagePlus className="size-3" />
                Add Photos
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload clinic or service photos</TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {GALLERY_IMAGES.map((img) => (
            <div
              key={img.src}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-sm group"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
              <span className="absolute bottom-2 left-2 text-[11px] font-medium text-card bg-foreground/60 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                {img.alt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  fieldId,
  value,
  isEditing,
  onChange,
  icon,
}: {
  label: string
  fieldId: string
  value: string
  isEditing: boolean
  onChange: (v: string) => void
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={fieldId} className="text-xs text-muted-foreground shrink-0 font-normal">
        {label}
      </Label>
      {isEditing ? (
        <Input
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs max-w-[200px] text-right"
        />
      ) : (
        <div className="flex items-center gap-1">
          {icon}
          <span className="text-xs text-foreground font-medium text-right">
            {value}
          </span>
        </div>
      )}
    </div>
  )
}
