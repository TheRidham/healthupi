import { format } from "date-fns";
import type { SimpleSlot, ApiTimeSlot, Appointment } from "@/types/doctor-profile";
import {
  TIME_SLOTS_28_FEB,
  TIME_SLOTS_1_MAR,
  TIME_SLOTS_OTHER,
} from "@/constants/doctor-profile";

// ── Time conversion helpers ───────────────────────────────────────

/** "HH:MM" → total minutes */
export function convertToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/** total minutes → "H:MM AM/PM" */
export function minutesToTime12h(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

/** Compare two 12-hour time strings for ascending sort */
function compareTime12h(a: string, b: string): number {
  // Convert back to sortable format: prepend AM/PM bucket then numeric value
  const toSortKey = (t: string) => {
    const isPM = t.includes("PM");
    const [h, rest] = t.replace(/ [AP]M/, "").split(":");
    return (isPM ? 12 : 0) * 60 + Number(h) * 60 + Number(rest);
  };
  return toSortKey(a) - toSortKey(b);
}

// ── Slot generation ───────────────────────────────────────────────

/**
 * Returns the slots for a given date.
 * When `apiTimeSlots` is provided it drives the grid; otherwise falls back to
 * the hard-coded demo data.
 */
export function getSlotsForDate(
  date: Date,
  apiTimeSlots: ApiTimeSlot[] = [],
  appointments: Appointment[] = [],
): SimpleSlot[] {
  const day = date.getDay();
  const dateStr = format(date, "yyyy-MM-dd");

  // Build set of booked "HH:MM" strings for fast look-up
  const bookedTimes = new Set(
    appointments
      .filter((apt) => apt.appointment_date === dateStr)
      .map((apt) => apt.start_time?.substring(0, 5))
      .filter(Boolean) as string[],
  );

  // ── API-driven path ──
  if (apiTimeSlots.length > 0) {
    const daySlots = apiTimeSlots.filter(
      (slot) => slot.day_of_week === day && slot.is_available,
    );
    if (daySlots.length === 0) return [];

    const allSlots: SimpleSlot[] = [];

    for (const slot of daySlots) {
      const duration = slot.appointment_duration ?? 30;
      const startMinutes = convertToMinutes(slot.start_time);
      const endMinutes = convertToMinutes(slot.end_time);

      let current = startMinutes;
      while (current + duration <= endMinutes) {
        const hhmm = `${Math.floor(current / 60).toString().padStart(2, "0")}:${(current % 60).toString().padStart(2, "0")}`;
        allSlots.push({
          time: minutesToTime12h(current),
          endTime: minutesToTime12h(current + duration),
          duration,
          available: !bookedTimes.has(hhmm),
        });
        current += duration;
      }
    }

    return allSlots.sort((a, b) => compareTime12h(a.time, b.time));
  }

  // ── Fallback demo data ──
  if (day === 0) return []; // Sunday – closed
  if (day === 6)
    return TIME_SLOTS_OTHER.filter((s) => parseInt(s.time.split(":")[0]) < 12);

  if (dateStr === "2026-02-28") return TIME_SLOTS_28_FEB;
  if (dateStr === "2026-03-01") return TIME_SLOTS_1_MAR;
  return TIME_SLOTS_OTHER;
}

/** Number of available slots for a date (used for day-picker badges). */
export function getSlotCountForDate(
  date: Date,
  apiTimeSlots: ApiTimeSlot[] = [],
  appointments: Appointment[] = [],
): number {
  return getSlotsForDate(date, apiTimeSlots, appointments).length;
}