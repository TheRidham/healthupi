"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthProvider";
import { DoctorProfile } from "@/types/doctor";
import { ArrowLeft, LoaderCircle } from "lucide-react";

// Import modular components
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
import { BookingState, SelectedSlot, BookingFormData } from "@/types/booking";

export default function PublicDoctorPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const doctorId = params.id as string;

  // Doctor & Services State
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Flow State
  const [bookingStep, setBookingStep] = useState<
    "service" | "timeSlot" | "auth" | "form" | "payment" | "success" | null
  >(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [patientFormData, setPatientFormData] = useState<BookingFormData | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);

  // Fetch doctor details and services
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const supabase = (await import("@/lib/supabase/client"))
          .createClientBrowser();

        // Fetch full doctor profile
        const { data: fullProfile, error: dbError } = await supabase
          .from("doctor_profiles")
          .select("*")
          .eq("user_id", doctorId)
          .single();

        if (dbError || !fullProfile) {
          console.error("Error fetching full profile:", dbError);
          setError("Could not fetch complete doctor profile");
          return;
        }

        // Fetch doctor services with service details
        const { data: doctorServices, error: servicesError } = await supabase
          .from("doctor_services")
          .select(`
            doctor_id,
            service_id,
            fee,
            services:service_id(
              id,
              name,
              description,
              duration_minutes
            )
          `)
          .eq("doctor_id", doctorId);

        if (servicesError) {
          console.error("Error fetching services:", servicesError);
        }

        // Map doctor services to Service interface
        const mappedServices: Service[] = (doctorServices || [])
          .map((ds: any) => ({
            id: ds.service_id,
            name: ds.services?.name || "",
            description: ds.services?.description || "",
            duration: ds.services?.duration_minutes || 30,
            fee: ds.fee,
            iconType: ds.service_id || "consultation",
            selected: false,
          }))
          .filter((s) => s.name); // Filter out empty services

        // If no services from DB, use predefined
        if (mappedServices.length > 0) {
          setServices(mappedServices);
        } else {
          setServices([]);
        }

        setDoctor(fullProfile as DoctorProfile);
      } catch (err: any) {
        console.error("Error fetching doctor:", err);
        setError(err.message || "Failed to load doctor profile");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);

  const toggleService = (serviceId: string) => {
    setServices(
      services.map((s) =>
        s.id === serviceId ? { ...s, selected: !s.selected } : s
      )
    );
  };

  const selectedServicesFromState = services.filter((s) => s.selected);

  // Booking Flow Handlers
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

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowOTPModal(true);
      setBookingStep("auth");
    } else {
      setBookingStep("form");
    }
  };

  const handleOTPSuccess = (userId: string) => {
    setShowOTPModal(false);
    setBookingStep("form");
  };

  const handleFormSubmit = async (formData: BookingFormData) => {
    setPatientFormData(formData);

    // Save patient profile immediately if authenticated
    if (isAuthenticated && user?.id) {
      try {
        const saveResponse = await fetch("/api/patient/profile", {
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

        if (!saveResponse.ok) {
          console.error("Failed to save patient profile");
          // Continue anyway - the appointment/create will also save it
        }
      } catch (err) {
        console.error("Error saving patient profile:", err);
        // Continue anyway
      }
    }

    setBookingStep("payment");
  };

  const handlePaymentSuccess = async (razorpayOrderId: string) => {
    try {
      // Create appointment
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
      setAppointmentId(data.data.appointmentId);
      setConfirmationNumber(data.data.confirmationNumber);
      setBookingStep("success");
    } catch (err) {
      console.error("Error creating appointment:", err);
      alert(err instanceof Error ? err.message : "Failed to complete booking");
      setBookingStep("payment");
    }
  };

  const handleReset = () => {
    setBookingStep(null);
    setSelectedServices([]);
    setSelectedSlot(null);
    setPatientFormData(null);
    setAppointmentId(null);
    setConfirmationNumber(null);
    setServices(services.map((s) => ({ ...s, selected: false })));
  };

  const handleCancel = () => {
    handleReset();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <LoaderCircle className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground/70">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <p className="text-destructive font-semibold mb-4">
            {error || "Doctor not found"}
          </p>
          <Button
            onClick={() => router.push("/doctors")}
            className="w-full"
          >
            Back to Doctors List
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button - Only show if not in booking flow */}
        {bookingStep === null && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-primary hover:text-primary/80"
          >
            <ArrowLeft size={20} /> Back
          </Button>
        )}

        {/* Booking Step Indicator */}
        {bookingStep !== null && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (bookingStep === "timeSlot") setBookingStep("service");
                  else if (bookingStep === "form" || bookingStep === "auth")
                    setBookingStep("timeSlot");
                  else if (bookingStep === "payment") setBookingStep("form");
                }}
                className="p-1 hover:bg-secondary rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-primary" />
              </button>
              <p className="text-sm font-semibold text-foreground/60">
                Step {bookingStep === "service" ? "1" : bookingStep === "timeSlot" ? "2" : bookingStep === "form" ? "3" : bookingStep === "payment" ? "4" : "5"} of 5
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-sm text-foreground/60 hover:text-foreground underline"
            >
              Cancel Booking
            </button>
          </div>
        )}

        {/* Step 1: Doctor Profile + Service Selection */}
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

        {/* Step 2: Time Slot Selection */}
        {bookingStep === "timeSlot" && (
          <>
            <DoctorHeader doctor={doctor} />

            <TimeSlotSelector
              doctorId={doctorId}
              selectedServices={selectedServices}
              onSlotSelected={handleSlotSelected}
              onBack={() => setBookingStep("service")}
              onCancel={handleCancel}
            />
          </>
        )}

        {/* Step 3: Phone OTP (if not authenticated) */}
        <PhoneOTPModal
          isOpen={showOTPModal}
          onClose={() => {
            setShowOTPModal(false);
            setBookingStep("timeSlot");
          }}
          onSuccess={handleOTPSuccess}
        />

        {/* Step 4: Booking Form */}
        {bookingStep === "form" && selectedSlot && doctor && (
          <>
            <DoctorHeader doctor={doctor} />

            <BookingForm
              doctorId={doctorId}
              doctorName={`${doctor.first_name} ${doctor.last_name}`}
              selectedServices={selectedServices}
              selectedSlot={selectedSlot}
              onSubmit={handleFormSubmit}
              onBack={() => setBookingStep("timeSlot")}
              onCancel={handleCancel}
            />
          </>
        )}

        {/* Step 5: Payment */}
        {bookingStep === "payment" && patientFormData && selectedSlot && (
          <>
            <DoctorHeader doctor={doctor} />

            <PaymentModal
              doctorId={doctorId}
              doctorName={`${doctor?.first_name} ${doctor?.last_name}` || "Doctor"}
              selectedServices={selectedServices}
              selectedSlot={selectedSlot}
              patientData={patientFormData}
              onPaymentSuccess={handlePaymentSuccess}
              onBack={() => setBookingStep("form")}
              onCancel={handleCancel}
            />
          </>
        )}

        {/* Step 6: Success */}
        {bookingStep === "success" && appointmentId && confirmationNumber && (
          <>
            <DoctorHeader doctor={doctor} />

            <SuccessModal
              doctorName={`${doctor?.first_name} ${doctor?.last_name}` || "Doctor"}
              serviceName={selectedServices[0]?.name || "Service"}
              appointmentDate={selectedSlot?.date || ""}
              appointmentTime={`${selectedSlot?.startTime.slice(0, 5)} - ${selectedSlot?.endTime.slice(
                0,
                5
              )}` || ""}
              duration={selectedSlot?.duration || 0}
              fee={selectedServices[0]?.fee || 0}
              confirmationNumber={confirmationNumber}
              appointmentId={appointmentId}
              patientName={patientFormData?.fullName || ""}
              onClose={handleReset}
            />
          </>
        )}
      </div>
    </div>
  );
}