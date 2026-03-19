"use client";

import { useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addDays, format, startOfToday } from "date-fns";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { BookingModal } from "./booking-modal";
import { PaymentSuccess } from "./payment-success";

import { useAuth } from "@/providers/authProvider";
import { useBooking } from "@/providers/BookingProvider";
import { sendEmail } from "@/lib/email/emailHelper";

import { useDoctorData } from "@/hooks/useDoctorData";
import { useBookingState } from "@/hooks/useBookingState";
import { buildServiceList } from "./service";

import { DoctorHeroCard } from "./DoctorHeroCard";
import { ServiceSelector } from "./ServiceSelector";
import { DateTimeSelector } from "./DateTimeSelector";
import { BookingSummaryBar } from "./BookingSummaryBar";
import { DoctorInfoCards } from "./DoctorInfoCards";
import { ClinicGallery } from "./ClinicGallery";
import {
  LoadingState,
  ErrorState,
  VerifyingPaymentState,
} from "./StateScreens";

import { FALLBACK_DOCTOR } from "@/constants/doctor-profile";
import type { ServiceOption } from "@/types/doctor-profile";

// ── Props ─────────────────────────────────────────────────────────

interface DoctorProfilePageProps {
  doctorId?: string;
}

// ── Component ─────────────────────────────────────────────────────

export function DoctorProfilePage({ doctorId }: DoctorProfilePageProps) {
  const router = useRouter();
  const today = startOfToday();
  const { user } = useAuth();
  const { setPendingBooking } = useBooking();

  // Remote data
  const {
    doctor,
    loading,
    error,
    timeSlots,
    appointments,
    refetchAppointments,
  } = useDoctorData(doctorId);

  // Local UI / booking state
  const {
    view,
    setView,
    isBookingMode,
    setIsBookingMode,
    isFollowUp,
    setIsFollowUp,
    selectedService,
    setSelectedService,
    selectedDay,
    setSelectedDay,
    selectedSlot,
    setSelectedSlot,
    weekOffset,
    setWeekOffset,
    showBookingModal,
    setShowBookingModal,
    timeSectionRef,
    continueSectionRef,
    handleSelectService,
    handleSelectSlot,
    resetToMain,
  } = useBookingState();

  // Re-fetch appointments whenever the selected day changes
  useEffect(() => {
    refetchAppointments(selectedDay);
  }, [selectedDay]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build week days array
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => addDays(today, weekOffset * 7 + i)),
    [today, weekOffset],
  );

  // Merge API data with fallback
  const currentDoctor = useMemo(
    () => ({
      ...FALLBACK_DOCTOR,
      ...doctor,
      id: doctorId ?? "rahul-sharma",
    }),
    [doctor, doctorId],
  );

  // Build service list from API or fallback
  const serviceList = useMemo(
    () => buildServiceList(doctor?.services ?? []),
    [doctor?.services],
  );

  // ── Early returns ──────────────────────────────────────────────
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (view === "verify") return <VerifyingPaymentState />;
  if (view === "success") {
    return (
      <PaymentSuccess onBack={resetToMain} doctorName={currentDoctor.name} />
    );
  }

  // ── Handlers ──────────────────────────────────────────────────

  function handleContinueToBooking() {
    if (!selectedService || !selectedSlot) return;

    if (!user || user.role !== "patient") {
      setPendingBooking({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceType: selectedService.type,
        serviceDescription: selectedService.description,
        date: selectedDay.toISOString(),
        timeSlot: selectedSlot.time,
        timeSlotEnd: selectedSlot.endTime,
        timeSlotDuration: selectedSlot.duration,
        doctorId: doctorId as string,
      });
      router.push(`/patient/signin?redirect=/doctor/${doctorId}`);
      return;
    }

    setIsFollowUp(selectedService.type === "followup");
    setShowBookingModal(true);
  }

  async function handlePaymentSuccess(appointmentData: any) {
    if (!appointmentData) return;
    setView("verify");

    try {
      const appointmentDate = new Date(appointmentData.appointment_date);
      const formattedDate = format(appointmentDate, "d MMMM yyyy");
      const emailTo = appointmentData.patientEmail ?? user?.email ?? "";
      const nameTo = appointmentData.patientName ?? user?.name ?? "Patient";
      const meetingLink =
        doctor?.googleMeetLink ??
        `${process.env.NEXT_PUBLIC_BASE_URL}/meet/${appointmentData.id}`;

      const emailPayload = {
        doctorName: doctor?.name ?? "Doctor",
        specialization: doctor?.specialization ?? "",
        date: formattedDate,
        time: appointmentData.start_time,
        endTime: appointmentData.end_time,
        appointmentDate: appointmentData.appointment_date,
        durationMinutes: selectedSlot?.duration,
        mode: appointmentData.serviceType,
        meetingLink,
        appointmentId: appointmentData.id,
        location: doctor?.address,
      };

      console.log("email payload: ", emailPayload)

      const [patientRes] = await Promise.all([
        sendEmail("consultation", {
          ...emailPayload,
          patientEmail: emailTo,
          patientName: nameTo,
        }),
        sendEmail("doctorAppointmentMail", {
          ...emailPayload,
          doctorEmail: doctor?.email,
          patientName: nameTo,
        }),
      ]);

      if (patientRes.success) {
        toast.success(`Confirmation email sent to ${emailTo}`);
      } else {
        console.error("[DoctorProfilePage] Email failed:", patientRes.error);
      }
    } catch (err) {
      console.error("[DoctorProfilePage] handlePaymentSuccess error:", err);
      toast.error("There was an issue sending the confirmation email");
    }

    setShowBookingModal(false);
    setView("success");
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Sticky mini-header */}
      <header className="sticky top-14 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-9 rounded-full overflow-hidden border border-border">
              <Image
                src={currentDoctor.avatar!}
                alt=""
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {currentDoctor.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {currentDoctor.specialization}
              </p>
            </div>
          </div>
          <Badge className="bg-accent text-accent-foreground border-none text-[11px]">
            <span className="size-1.5 rounded-full bg-accent-foreground/80 mr-1.5 animate-pulse" />
            Available
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {isBookingMode ? (
            <BookingView
              doctor={currentDoctor}
              days={days}
              weekOffset={weekOffset}
              timeSlots={timeSlots}
              appointments={appointments}
              selectedService={selectedService}
              selectedDay={selectedDay}
              selectedSlot={selectedSlot}
              serviceList={serviceList}
              isFollowUp={isFollowUp}
              timeSectionRef={timeSectionRef}
              continueSectionRef={continueSectionRef}
              onSelectService={handleSelectService}
              onSelectSlot={handleSelectSlot}
              onDayChange={(d) => {
                setSelectedDay(d);
                setSelectedSlot(null);
              }}
              onWeekPrev={() => setWeekOffset((p) => Math.max(0, p - 1))}
              onWeekNext={() => setWeekOffset((p) => p + 1)}
              onContinue={handleContinueToBooking}
              onBackToServices={() => {
                setIsFollowUp(false);
                setSelectedService(null);
                setSelectedSlot(null);
              }}
              onBackToProfile={() => {
                setIsBookingMode(false);
                setSelectedService(null);
                setSelectedSlot(null);
                setIsFollowUp(false);
              }}
            />
          ) : (
            <ProfileView
              doctor={currentDoctor}
              onBook={() => setIsBookingMode(true)}
            />
          )}
        </div>
      </main>

      {/* Booking modal */}
      {showBookingModal && selectedService && selectedSlot && (
        <BookingModal
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handlePaymentSuccess}
          service={selectedService}
          date={selectedDay}
          timeSlot={selectedSlot}
          doctorId={doctorId ?? "rahul-sharma"}
          doctorUserId={doctor?.user_id as string}
          doctorName={currentDoctor.name}
          isFollowUp={isFollowUp}
        />
      )}
    </div>
  );
}

// ── Booking sub-view ──────────────────────────────────────────────

interface BookingViewProps {
  doctor: any;
  days: Date[];
  weekOffset: number;
  timeSlots: any[];
  appointments: any[];
  selectedService: ServiceOption | null;
  selectedDay: Date;
  selectedSlot: any;
  serviceList: ServiceOption[];
  isFollowUp: boolean;
  timeSectionRef: React.RefObject<HTMLDivElement | null>;
  continueSectionRef: React.RefObject<HTMLDivElement | null>;
  onSelectService: (s: ServiceOption) => void;
  onSelectSlot: (s: any) => void;
  onDayChange: (d: Date) => void;
  onWeekPrev: () => void;
  onWeekNext: () => void;
  onContinue: () => void;
  onBackToServices: () => void;
  onBackToProfile: () => void;
}

function BookingView({
  doctor,
  days,
  weekOffset,
  timeSlots,
  appointments,
  selectedService,
  selectedDay,
  selectedSlot,
  serviceList,
  isFollowUp,
  timeSectionRef,
  continueSectionRef,
  onSelectService,
  onSelectSlot,
  onDayChange,
  onWeekPrev,
  onWeekNext,
  onContinue,
  onBackToServices,
  onBackToProfile,
}: BookingViewProps) {
  return (
    <>
      <DoctorHeroCard doctor={doctor} />

      <Button
        variant="ghost"
        size="sm"
        onClick={isFollowUp ? onBackToServices : onBackToProfile}
        className="w-fit -ml-2 gap-1"
      >
        <ArrowRight className="size-3.5 rotate-180" />
        {isFollowUp ? "Back to Services" : "Back to Profile"}
      </Button>

      <ServiceSelector
        services={serviceList}
        selectedService={selectedService}
        onSelect={onSelectService}
      />

      {selectedService && (
        <DateTimeSelector
          ref={timeSectionRef}
          days={days}
          selectedDay={selectedDay}
          selectedSlot={selectedSlot}
          weekOffset={weekOffset}
          timeSlots={timeSlots}
          appointments={appointments}
          onDayChange={onDayChange}
          onSlotChange={onSelectSlot}
          onWeekPrev={onWeekPrev}
          onWeekNext={onWeekNext}
        />
      )}

      {selectedService && selectedSlot && (
        <BookingSummaryBar
          ref={continueSectionRef}
          service={selectedService}
          date={selectedDay}
          slot={selectedSlot}
          onContinue={onContinue}
        />
      )}
    </>
  );
}

// ── Profile sub-view ──────────────────────────────────────────────

function ProfileView({ doctor, onBook }: { doctor: any; onBook: () => void }) {
  return (
    <>
      <DoctorHeroCard doctor={doctor} />

      <Card className="py-4 border-primary/20 bg-primary/[0.02]">
        <CardContent className="px-5 py-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Ready to book?
            </p>
            <p className="text-xs text-muted-foreground">
              Select a service and schedule your appointment
            </p>
          </div>
          <Button size="sm" onClick={onBook} className="gap-1.5">
            Book Appointment
            <ArrowRight className="size-3.5" />
          </Button>
        </CardContent>
      </Card>

      <DoctorInfoCards doctor={doctor} />
      <ClinicGallery images={doctor.galleryImages ?? []} />
    </>
  );
}
