"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { DoctorData, ApiTimeSlot, Appointment } from "@/types/doctor-profile";

interface UseDoctorDataReturn {
  doctor: DoctorData | null;
  loading: boolean;
  error: string;
  timeSlots: ApiTimeSlot[];
  appointments: Appointment[];
  refetchAppointments: (date: Date) => Promise<void>;
}

export function useDoctorData(doctorId?: string): UseDoctorDataReturn {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeSlots, setTimeSlots] = useState<ApiTimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Fetch profile
  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/doctor/${doctorId}`);
        const result = await res.json();
        if (cancelled) return;

        if (result.success) {
          setDoctor(result.data);
        } else {
          setError(result.error || "Failed to load doctor profile");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[useDoctorData] profile fetch error:", err);
          setError("Failed to load doctor profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [doctorId]);

  // Fetch time-slots on mount
  useEffect(() => {
    if (!doctorId) return;

    const fetchSlots = async () => {
      try {
        const dateStr = format(new Date(), "yyyy-MM-dd");
        const res = await fetch(`/api/doctor/${doctorId}/public-timeslots?date=${dateStr}`);
        const result = await res.json();

        if (result.success) {
          setTimeSlots(result.data.timeSlots ?? []);
          setAppointments(result.data.appointments ?? []);
        }
      } catch (err) {
        console.error("[useDoctorData] time-slots fetch error:", err);
      }
    };

    fetchSlots();
  }, [doctorId]);

  /** Re-fetch appointments whenever the selected day changes. */
  const refetchAppointments = async (date: Date) => {
    if (!doctorId) return;
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await fetch(`/api/doctor/${doctorId}/public-timeslots?date=${dateStr}`);
      const result = await res.json();

      if (result.success && result.data.appointments) {
        setAppointments(result.data.appointments);
      }
    } catch (err) {
      console.error("[useDoctorData] appointments re-fetch error:", err);
    }
  };

  return { doctor, loading, error, timeSlots, appointments, refetchAppointments };
}