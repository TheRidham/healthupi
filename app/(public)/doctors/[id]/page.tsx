"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthProvider";
import { DoctorProfile } from "@/types/doctor";
import { ArrowLeft, LoaderCircle } from "lucide-react";

import DoctorHeader from "@/components/doctor-profile-public/DoctorHeader";
import ServicesSection from "@/components/doctor-profile-public/ServicesSection";
import ProfessionalInfo from "@/components/doctor-profile-public/ProfessionalInfo";
import ClinicInfo from "@/components/doctor-profile-public/ClinicInfo";
import ClinicPhotos from "@/components/doctor-profile-public/ClinicPhotos";
import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import PhoneOTPModal from "@/components/booking/PhoneOTPModal";
import BookingForm from "@/components/booking/BookingForm";
import PaymentModal from "@/components/booking/PaymentModal";
import SuccessModal from "@/components/booking/SuccessModal";
import { Service } from "@/components/doctor-profile-public/services.utils";
import { SelectedSlot, BookingFormData } from "@/types/booking";
import { getOrCreateConversationForAppointment } from "@/services/chat.service";

// ─── Step type ────────────────────────────────────────────────────────────────
// null        = profile view / service selection (step 1)
// "timeSlot"  = pick date & time       (step 2)
// "auth"      = OTP verification        (step 2.5 — no counter shown)
// "form"      = patient details form    (step 3)
// "payment"   = payment                 (step 4)
// "success"   = confirmation            (step 5)

type BookingStep = null | "timeSlot" | "auth" | "form" | "payment" | "success";

// ─── Step counter helper ──────────────────────────────────────────────────────
function getStepLabel(step: BookingStep): string | null {
  switch (step) {
    case null:
      return "Step 1 of 5";
    case "timeSlot":
      return "Step 2 of 5";
    case "auth":
      return null; // OTP modal overlays — no counter
    case "form":
      return "Step 3 of 5";
    case "payment":
      return "Step 4 of 5";
    case "success":
      return "Step 5 of 5";
    default:
      return null;
  }
}

// ─── Back handler helper ──────────────────────────────────────────────────────
function getPreviousStep(step: BookingStep): BookingStep {
  switch (step) {
    case "timeSlot":
      return null; // back to profile + service selection
    case "auth":
      return "timeSlot"; // back to slot picker
    case "form":
      return "timeSlot"; // back to slot picker (whether authed or not)
    case "payment":
      return "form";
    default:
      return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PublicDoctorPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const doctorId = params.id as string;
  
  // ── Doctor & Services ──────────────────────────────────────────────────────
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Booking flow ───────────────────────────────────────────────────────────
  const [bookingStep, setBookingStep] = useState<BookingStep>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [patientFormData, setPatientFormData] =
    useState<BookingFormData | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(
    null,
  );
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  // OTP modal is independent of bookingStep — it overlays on top
  const [showOTPModal, setShowOTPModal] = useState(false);

  // ── Fetch doctor + services ────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const { createClientBrowser: createClient } =
          await import("@/lib/supabase/client");
        const supabase = createClient();

        const { data: fullProfile, error: dbError } = await supabase
          .from("doctor_profiles")
          .select("*")
          .eq("user_id", doctorId)
          .single();

        if (dbError || !fullProfile) {
          setError("Could not fetch complete doctor profile");
          return;
        }

        const { data: doctorServices, error: servicesError } = await supabase
          .from("doctor_services")
          .select(
            `
            doctor_id,
            service_id,
            fee,
            services:service_id (
              id,
              name,
              description,
              duration_minutes
            )
          `,
          )
          .eq("doctor_id", doctorId);

        if (servicesError) {
          console.error("Error fetching services:", servicesError);
        }

        const mappedServices: Service[] = (doctorServices ?? [])
          .map((ds: any) => ({
            id: ds.service_id,
            name: ds.services?.name || "",
            description: ds.services?.description || "",
            duration: ds.services?.duration_minutes || 30,
            fee: ds.fee,
            iconType: ds.service_id || "consultation",
            selected: false,
          }))
          .filter((s: Service) => s.name);

        setServices(mappedServices);
        setDoctor(fullProfile as DoctorProfile);
        setMeetingLink(fullProfile?.google_meet_link);;
      } catch (err: any) {
        setError(err.message || "Failed to load doctor profile");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) fetchDoctorDetails();
  }, [doctorId]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const selectedServicesFromState = services.filter((s) => s.selected);

  const toggleService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        selected: s.id === serviceId ? !s.selected : false,
      })),
    );
  };

  const handleReset = () => {
    setBookingStep(null);
    setSelectedServices([]);
    setSelectedSlot(null);
    setPatientFormData(null);
    setAppointmentId(null);
    setConfirmationNumber(null);
    setMeetingLink(null);
    setShowOTPModal(false);
    setServices((prev) => prev.map((s) => ({ ...s, selected: false })));
  };

  const handleBack = () => {
    // On success step, reset everything instead of going back
    if (bookingStep === "success") {
      handleReset();
      return;
    }
    setBookingStep(getPreviousStep(bookingStep));
  };

  // ── Booking flow handlers ──────────────────────────────────────────────────

  const handleServiceProceed = () => {
    if (selectedServicesFromState.length === 0) {
      alert("Please select at least one service to proceed");
      return;
    }
    setSelectedServices(selectedServicesFromState);
    setBookingStep("timeSlot");
  };

  const handleSlotSelected = (slot: SelectedSlot) => {
    setSelectedSlot(slot);

    if (!isAuthenticated) {
      // Show OTP modal but keep bookingStep as "timeSlot"
      // so the slot selector remains mounted underneath
      setShowOTPModal(true);
      setBookingStep("auth");
    } else {
      setBookingStep("form");
    }
  };

  const handleOTPSuccess = (_userId: string) => {
    // OTP done — close modal and advance to form
    setShowOTPModal(false);
    setBookingStep("form");
  };

  const handleOTPClose = () => {
    // User dismissed OTP — go back to slot picker
    setShowOTPModal(false);
    setBookingStep("timeSlot");
  };

  const handleFormSubmit = async (formData: BookingFormData) => {
    setPatientFormData(formData);

    if (isAuthenticated && user?.id) {
      try {
        await fetch("/api/patient/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.fullName,
            gender: formData.gender,
            phone: formData.mobileNumber,
            email: formData.email,
            address: formData.address,
            age: formData.age,
          }),
        });
      } catch (err) {
        console.error("Error saving patient profile:", err);
        // Non-fatal — appointment creation will handle it
      }
    }

    setBookingStep("payment");
  };

  const handlePaymentSuccess = async (razorpayOrderId: string) => {
    try {
      const response = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          patientData: patientFormData,
          slot: selectedSlot,
          services: selectedServices,
          razorpayOrderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      const data = await response.json();

      if (!user?.id) {
        throw new Error("User ID is required to create appointment");
      }

      if(selectedServices[0].name.toLowerCase().includes('chat')) {
        const participants = [
          { userId: doctorId, role: "doctor" },
          { userId: user.id, role: "patient" },
        ];

        // create conversation with doctor and patient as participants
        const conversationId = await getOrCreateConversationForAppointment({
          appointmentId: data.data.appointmentId,
          type: "chat",
          participants,
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const chatMeetingLink = `${baseUrl}/chat/${conversationId}`;
        setMeetingLink(chatMeetingLink);
      }

      setAppointmentId(data.data.appointmentId);
      setConfirmationNumber(data.data.confirmationNumber);
      setBookingStep("success");
    } catch (err) {
      console.error("Error creating appointment:", err);
      alert(err instanceof Error ? err.message : "Failed to complete booking");
      setBookingStep("payment");
    }
  };

  // ── Render guards ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="text-center">
          <LoaderCircle className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground/70">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center border-border bg-card">
          <p className="text-destructive font-semibold mb-4">
            {error || "Doctor not found"}
          </p>
          <Button onClick={() => router.push("/doctors")} className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700">
            Back to Doctors List
          </Button>
        </Card>
      </div>
    );
  }

  const stepLabel = getStepLabel(bookingStep);
  const isInBookingFlow = bookingStep !== null;
  // Don't show back arrow on success — show reset instead
  const canGoBack = isInBookingFlow && bookingStep !== "success";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button — profile view */}
        {!isInBookingFlow && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-primary hover:text-primary/80 hover:bg-primary/5 font-medium gap-1.5 text-sm"
          >
            <ArrowLeft size={16} /> Back
          </Button>
        )}

        {/* Step indicator — booking flow */}
        {isInBookingFlow && bookingStep !== "auth" && (
          <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2">
              {canGoBack && (
                <button
                  onClick={handleBack}
                  className="p-1.5 hover:bg-secondary/70 rounded-lg transition-colors"
                  title="Go back"
                >
                  <ArrowLeft size={16} className="text-primary" />
                </button>
              )}
              {stepLabel && (
                <p className="text-xs font-semibold text-foreground/70">
                  {stepLabel}
                </p>
              )}
            </div>
            {bookingStep !== "success" && (
              <button
                onClick={handleReset}
                className="text-xs text-foreground/60 hover:text-destructive font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {/* ── Step 1: Profile + Service Selection ── */}
        {bookingStep === null && (
          <>
            <DoctorHeader doctor={doctor} />
            <ServicesSection
              services={services}
              selectedServices={selectedServicesFromState}
              onToggleService={toggleService}
              onProceed={handleServiceProceed}
              isLoading={false}
              onCancel={() => router.back()}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <ProfessionalInfo doctor={doctor} />
              <ClinicInfo doctor={doctor} />
            </div>
            <ClinicPhotos photos={doctor.clinic_photo_urls} />
          </>
        )}

        {/* ── Step 2: Time Slot Selection ── */}
        {(bookingStep === "timeSlot" || bookingStep === "auth") && (
          <>
            <DoctorHeader doctor={doctor} />
            <TimeSlotSelector
              doctorId={doctorId}
              selectedServices={selectedServices}
              onSlotSelected={handleSlotSelected}
              onBack={() => setBookingStep(null)}
              onCancel={handleReset}
            />
          </>
        )}

        {/* ── OTP Modal (overlays on top of time slot selector) ── */}
        <PhoneOTPModal
          isOpen={showOTPModal}
          onClose={handleOTPClose}
          onSuccess={handleOTPSuccess}
        />

        {/* ── Step 3: Patient Details Form ── */}
        {bookingStep === "form" && selectedSlot && (
          <>
            <DoctorHeader doctor={doctor} />
            <BookingForm
              doctorId={doctorId}
              doctorName={`${doctor.first_name} ${doctor.last_name}`}
              selectedServices={selectedServices}
              selectedSlot={selectedSlot}
              onSubmit={handleFormSubmit}
              onBack={() => setBookingStep("timeSlot")}
              onCancel={handleReset}
            />
          </>
        )}

        {/* ── Step 4: Payment ── */}
        {bookingStep === "payment" && patientFormData && selectedSlot && (
          <>
            <DoctorHeader doctor={doctor} />
            <PaymentModal
              doctorId={doctorId}
              doctorName={`${doctor.first_name} ${doctor.last_name}`}
              selectedServices={selectedServices}
              selectedSlot={selectedSlot}
              patientData={patientFormData}
              onPaymentSuccess={handlePaymentSuccess}
              onBack={() => setBookingStep("form")}
              onCancel={handleReset}
            />
          </>
        )}

        {/* ── Step 5: Success ── */}
        {bookingStep === "success" &&
          appointmentId &&
          confirmationNumber &&
          selectedSlot && (
            <>
              <DoctorHeader doctor={doctor} />
              <SuccessModal
                doctorName={`${doctor.first_name} ${doctor.last_name}`}
                serviceName={selectedServices[0]?.name || "Service"}
                appointmentDate={selectedSlot.date}
                startTime={selectedSlot.startTime.slice(0, 5)}
                endTime={selectedSlot.endTime.slice(0, 5)}
                duration={selectedSlot.duration}
                fee={selectedServices[0]?.fee || 0}
                confirmationNumber={confirmationNumber}
                appointmentId={appointmentId}
                patientName={patientFormData?.fullName || ""}
                patientEmail={patientFormData?.email || ""}
                doctorEmail={doctor.email}
                location={`${doctor.clinic_name}, ${doctor.address}, ${doctor.city}`}
                onClose={handleReset}
                meetingLink={meetingLink}
              />
            </>
          )}
      </div>
    </div>
  );
}
