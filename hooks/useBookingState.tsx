"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { startOfToday } from "date-fns";
import { RotateCcw, Video } from "lucide-react";
import type { SimpleSlot, ServiceOption, ViewMode } from "@/types/doctor-profile";
import { useAuth } from "@/providers/authProvider";
import { useBooking } from "@/providers/BookingProvider";

interface UseBookingStateReturn {
  // View
  view: ViewMode;
  setView: (v: ViewMode) => void;
  isBookingMode: boolean;
  setIsBookingMode: (v: boolean) => void;
  isFollowUp: boolean;
  setIsFollowUp: (v: boolean) => void;

  // Service
  selectedService: ServiceOption | null;
  setSelectedService: (s: ServiceOption | null) => void;

  // Date & slot
  selectedDay: Date;
  setSelectedDay: (d: Date) => void;
  selectedSlot: SimpleSlot | null;
  setSelectedSlot: (s: SimpleSlot | null) => void;
  weekOffset: number;
  setWeekOffset: (n: number | ((p: number) => number)) => void;

  // Modal
  showBookingModal: boolean;
  setShowBookingModal: (v: boolean) => void;

  // Scroll refs
  timeSectionRef: React.RefObject<HTMLDivElement | null>;
  continueSectionRef: React.RefObject<HTMLDivElement | null>;

  // Handlers
  handleSelectService: (service: ServiceOption) => void;
  handleSelectSlot: (slot: SimpleSlot) => void;
  resetToMain: () => void;
}

export function useBookingState(): UseBookingStateReturn {
  const today = startOfToday();
  const { user } = useAuth();
  const { pendingBooking, clearPendingBooking } = useBooking();

  const [view, setView] = useState<ViewMode>("main");
  const [isBookingMode, setIsBookingMode] = useState(true);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<SimpleSlot | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const timeSectionRef = useRef<HTMLDivElement>(null);
  const continueSectionRef = useRef<HTMLDivElement>(null);

  const scrollToIfNeeded = (el: HTMLElement | null) => {
    if (!el) return;
    const { top, bottom } = el.getBoundingClientRect();
    if (top < 0 || bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSelectService = useCallback((service: ServiceOption) => {
    setSelectedService(service);
    setSelectedSlot(null);
    setTimeout(() => scrollToIfNeeded(timeSectionRef.current), 100);
  }, []);

  const handleSelectSlot = useCallback((slot: SimpleSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setTimeout(() => scrollToIfNeeded(continueSectionRef.current), 100);
  }, []);

  const resetToMain = useCallback(() => {
    setView("main");
    setSelectedService(null);
    setSelectedSlot(null);
    setIsFollowUp(false);
    setIsBookingMode(false);
  }, []);

  // Restore a pending booking after the user signs in
  useEffect(() => {
    if (!pendingBooking || !user || user.role !== "patient") return;

    try {
      const service: ServiceOption = {
        id: pendingBooking.serviceId,
        name: pendingBooking.serviceName,
        price: pendingBooking.servicePrice,
        type: pendingBooking.serviceType as "service" | "followup",
        icon: pendingBooking.serviceType === "followup"
          ? <RotateCcw className="size-5" />
          : <Video className="size-5" />,
        description: pendingBooking.serviceDescription ?? "",
        enabled: true,
      };

      setSelectedService(service);
      setSelectedDay(new Date(pendingBooking.date));
      setSelectedSlot({
        time: pendingBooking.timeSlot,
        endTime: pendingBooking.timeSlotEnd,
        duration: pendingBooking.timeSlotDuration,
        available: true,
      });
      setIsFollowUp(pendingBooking.serviceType === "followup");
      setIsBookingMode(true);

      setTimeout(() => {
        setShowBookingModal(true);
        clearPendingBooking();
      }, 100);
    } catch (err) {
      console.error("[useBookingState] Error restoring pending booking:", err);
    }
    // Only run when user becomes available, not on every re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    view, setView,
    isBookingMode, setIsBookingMode,
    isFollowUp, setIsFollowUp,
    selectedService, setSelectedService,
    selectedDay, setSelectedDay,
    selectedSlot, setSelectedSlot,
    weekOffset, setWeekOffset,
    showBookingModal, setShowBookingModal,
    timeSectionRef, continueSectionRef,
    handleSelectService, handleSelectSlot,
    resetToMain,
  };
}