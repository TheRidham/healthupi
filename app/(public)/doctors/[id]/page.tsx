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
import {
  Service,
} from "@/components/doctor-profile-public/services.utils";

export default function PublicDoctorPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

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

  const selectedServices = services.filter((s) => s.selected);

  const handleProceed = async () => {
    if (!isAuthenticated) {
      router.push("/patient/login");
      return;
    }

    if (selectedServices.length === 0) {
      alert("Please select at least one service to proceed");
      return;
    }

    setBookingLoading(true);
    try {
      // Store selected services in session/state and redirect to booking page
      const bookingData = {
        doctorId,
        doctorName: `${doctor?.first_name} ${doctor?.last_name}`,
        services: selectedServices.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
        })),
      };

      // Save to localStorage for now (can be moved to a proper booking API later)
      localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

      router.push(`/booking/${doctorId}`);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to proceed with booking");
    } finally {
      setBookingLoading(false);
    }
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
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-primary hover:text-primary/80"
        >
          <ArrowLeft size={20} /> Back
        </Button>

        {/* Doctor Profile Header Card */}
        <DoctorHeader doctor={doctor} />

        {/* Ready to Book - Services Selection */}
        <ServicesSection
          services={services}
          selectedServices={selectedServices}
          onToggleService={toggleService}
          onProceed={handleProceed}
          isLoading={bookingLoading}
          onCancel={() => router.back()}
        />

        {/* Professional & Clinic Info - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ProfessionalInfo doctor={doctor} />
          <ClinicInfo doctor={doctor} />
        </div>

        {/* Clinic Photos */}
        <ClinicPhotos photos={doctor.clinic_photo_urls} />
      </div>
    </div>
  );
}