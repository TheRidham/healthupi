"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertCircle, LoaderCircle, X, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { BookingFormData, SelectedSlot, PatientProfile } from "@/types/booking";
import { format } from "date-fns";

interface BookingFormProps {
  doctorId: string;
  doctorName: string;
  selectedServices: Array<{ id: string; name: string; fee?: number }>;
  selectedSlot: SelectedSlot;
  onSubmit: (formData: BookingFormData) => void;
  onBack: () => void;
  onCancel: () => void;
}

export default function BookingForm({
  doctorId,
  doctorName,
  selectedServices,
  selectedSlot,
  onSubmit,
  onBack,
  onCancel,
}: BookingFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    age: 0,
    gender: "",
    mobileNumber: "",
    email: "",
    address: "",
    issueDescription: "",
  });

  // Load patient profile if authenticated
  useEffect(() => {
    const loadPatientProfile = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/patient/profile?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const profile = data.data;
            setPatientProfile(profile);

            // Pre-fill form with patient data
            setFormData((prev) => ({
              ...prev,
              fullName: profile.name || "",
              mobileNumber: profile.phone.replace(/\D/g, '').slice(-10) || "",
              email: profile.email || "",
              address: profile.address || "",
              gender: profile.gender || "",
              // Calculate age from date_of_birth if available
              age: profile.date_of_birth
                ? Math.floor(
                    (new Date().getTime() - new Date(profile.date_of_birth).getTime()) /
                      (365.25 * 24 * 60 * 60 * 1000)
                  )
                : 0,
            }));
          }
        }
      } catch (err) {
        console.error("Error loading patient profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPatientProfile();
  }, [isAuthenticated, user?.id]);

  // Auto-fill phone from auth if not already filled
  useEffect(() => {
    if (isAuthenticated && user?.phone && !formData.mobileNumber) {
      setFormData((prev) => ({
        ...prev,
        mobileNumber: user.phone?.replace(/\D/g, '').slice(-10) || "",
      }));
    }
  }, [isAuthenticated, user?.phone, formData.mobileNumber]);

  // Set initial loading to false if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name is required and must be at least 2 characters";
    }

    if (!formData.age || formData.age < 1 || formData.age > 150) {
      newErrors.age = "Please enter a valid age (1-150)";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }

    if (!formData.mobileNumber.trim() || formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof BookingFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Format mobile number to remove formatting
      const cleanFormData: BookingFormData = {
        ...formData,
        mobileNumber: formData.mobileNumber.replace(/\D/g, "").slice(-10),
      };

      onSubmit(cleanFormData);
    } finally {
      setSubmitting(false);
    }
  };

  const firstService = selectedServices[0];
  const appointmentDate = format(new Date(selectedSlot.date), "MMM d, yyyy");
  const appointmentTime = `${selectedSlot.startTime.slice(0, 5)} - ${selectedSlot.endTime.slice(0, 5)}`;

  if (loading) {
    return (
      <Card className="p-8 mb-8">
        <div className="flex items-center justify-center gap-3">
          <LoaderCircle className="w-5 h-5 animate-spin text-primary" />
          <p className="text-foreground/60">Loading your information...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 mb-8 border-primary/30 bg-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Book Appointment</h2>
          <p className="text-foreground/70">
            Fill in your details to confirm your booking with Dr. {doctorName}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-secondary/50 rounded-lg transition"
        >
          <X className="w-5 h-5 text-foreground/60" />
        </button>
      </div>

      {/* Service Summary */}
      <div className="mb-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">Service</p>
            <p className="font-semibold text-foreground">{firstService?.name}</p>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">
                Date & Time
              </p>
              <p className="font-semibold text-foreground text-sm">
                {appointmentDate} • {appointmentTime}
              </p>
            </div>
          </div>
          <div className="text-right">
            {firstService?.fee && (
              <div>
                <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">Fee</p>
                <p className="font-bold text-primary text-lg">₹{firstService.fee}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Full Name & Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className={`bg-secondary/50 border-secondary/50 ${
                errors.fullName ? "border-destructive" : ""
              }`}
              disabled={submitting}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-foreground">
              Age <span className="text-destructive">*</span>
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="0"
              value={formData.age || ""}
              onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)}
              min="1"
              max="150"
              className={`bg-secondary/50 border-secondary/50 ${
                errors.age ? "border-destructive" : ""
              }`}
              disabled={submitting}
            />
            {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
          </div>
        </div>

        {/* Row 2: Gender & Mobile Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-foreground">
              Gender <span className="text-destructive">*</span>
            </Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              disabled={submitting}
              className={`w-full px-3 py-2 rounded-lg bg-secondary/50 border border-secondary/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.gender ? "border-destructive" : ""
              }`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="text-foreground">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 pointer-events-none">
                +91
              </span>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="10-digit number"
                value={formData.mobileNumber}
                onChange={(e) =>
                  handleInputChange("mobileNumber", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                maxLength={10}
                className={`pl-12 bg-secondary/50 border-secondary/50 ${
                  errors.mobileNumber ? "border-destructive" : ""
                }`}
                disabled={submitting}
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-xs text-destructive">{errors.mobileNumber}</p>
            )}
          </div>
        </div>

        {/* Row 3: Email & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email <span className="text-foreground/50">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-secondary/50 border-secondary/50"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-foreground">
              Address <span className="text-foreground/50">(optional)</span>
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main St, City"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="bg-secondary/50 border-secondary/50"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Row 4: Issue Description */}
        <div className="space-y-2">
          <Label htmlFor="issueDescription" className="text-foreground">
            Describe your issue <span className="text-foreground/50">(optional)</span>
          </Label>
          <Textarea
            id="issueDescription"
            placeholder="Brief description of your concern or symptoms"
            value={formData.issueDescription}
            onChange={(e) => handleInputChange("issueDescription", e.target.value)}
            className="bg-secondary/50 border-secondary/50 resize-none"
            rows={3}
            disabled={submitting}
          />
        </div>

        {/* Error Message */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">
              Please fix the errors above to continue
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1 py-6"
            disabled={submitting}
          >
            ← Back
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
          >
            {submitting ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Payment →
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
