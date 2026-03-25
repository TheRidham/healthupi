import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, format, startOfToday } from "date-fns";
import { AvailableSlot } from "@/types/booking";

function timeToMinutes(time: string): number {
  const [h, m] = (time || "00:00:00").split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;
}

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getTimePeriod(time: string): "morning" | "afternoon" | "evening" {
  const hour = parseInt(time.split(":")[0]);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // Fetch time slots for next 7 days
    const today = startOfToday();
    const nextDates = Array.from({ length: 7 }, (_, i) =>
      format(addDays(today, i), "yyyy-MM-dd")
    );

    // Get day of week for each date (0 = Sunday, 6 = Saturday)
    const dayOfWeeks = Array.from({ length: 7 }, (_, i) => (i) % 7);

    const { data: timeSlots, error: slotsError } = await supabase
      .from("time_slots")
      .select("*")
      .eq("doctor_id", doctorId)
      .in("day_of_week", dayOfWeeks)
      .eq("is_available", true)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (slotsError) {
      console.error("Error fetching time slots:", slotsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch time slots" },
        { status: 500 }
      );
    }

    // Calculate available appointment slots
    const availableSlots: AvailableSlot[] = [];

    timeSlots?.forEach((slot) => {
      const dateIndex = slot.day_of_week;
      const slotDate = nextDates[dateIndex];

      if (!slotDate) return;

      const startMinutes = timeToMinutes(slot.start_time);
      const endMinutes = timeToMinutes(slot.end_time);
      const duration = slot.appointment_duration;

      // Generate individual appointment slots
      for (let currentMin = startMinutes; currentMin + duration <= endMinutes; currentMin += duration) {
        const appointmentStart = minutesToTime(currentMin);
        const appointmentEnd = minutesToTime(currentMin + duration);

        availableSlots.push({
          date: slotDate,
          startTime: appointmentStart,
          endTime: appointmentEnd,
          duration: duration,
          period: getTimePeriod(appointmentStart),
          formattedStart: formatTime12h(appointmentStart),
          formattedEnd: formatTime12h(appointmentEnd),
        });
      }
    });

    // Remove duplicates and sort by date and time
    const uniqueSlots = Array.from(
      new Map(
        availableSlots.map((slot) => [
          `${slot.date}-${slot.startTime}`,
          slot,
        ])
      ).values()
    ).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    return NextResponse.json({
      success: true,
      data: uniqueSlots,
    });
  } catch (error) {
    console.error("Unexpected error in available-slots:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
