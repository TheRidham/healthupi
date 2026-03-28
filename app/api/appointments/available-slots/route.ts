import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { addDays, format, startOfToday, getDay } from "date-fns"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = (time || "00:00:00").split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`
}

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const hour12 = h % 12 || 12
  const ampm = h >= 12 ? "PM" : "AM"
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`
}

function getTimePeriod(time: string): "morning" | "afternoon" | "evening" {
  const hour = parseInt(time.split(":")[0])
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get("doctorId")

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: "doctorId is required" },
        { status: 400 }
      )
    }

    const today = startOfToday()

    // Build map: day_of_week (0–6) → actual date strings for next 7 days
    // A single week can have each DOW appear exactly once
    const datesByDow = new Map<number, string>()
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i)
      const dow = getDay(date) // 0 = Sun … 6 = Sat
      datesByDow.set(dow, format(date, "yyyy-MM-dd"))
    }

    const uniqueDows = Array.from(datesByDow.keys())

    // 1. Fetch doctor's recurring time slots for those days of week
    const { data: timeSlots, error: slotsError } = await supabase
      .from("time_slots")
      .select("day_of_week, start_time, end_time, appointment_duration, is_available")
      .eq("doctor_id", doctorId)
      .in("day_of_week", uniqueDows)
      .eq("is_available", true)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true })

    if (slotsError) throw slotsError

    if (!timeSlots || timeSlots.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // 2. Fetch already booked appointments this week to mark slots as taken
    const startDate = format(today, "yyyy-MM-dd")
    const endDate = format(addDays(today, 6), "yyyy-MM-dd")

    const { data: bookedAppointments, error: bookedError } = await supabase
      .from("appointments")
      .select("appointment_date, start_time")
      .eq("doctor_id", doctorId)
      .gte("appointment_date", startDate)
      .lte("appointment_date", endDate)
      .in("status", ["confirmed", "rescheduled"])

    if (bookedError) throw bookedError

    // Set of "YYYY-MM-DD|HH:MM:SS" for O(1) lookup
    const bookedSet = new Set<string>(
      (bookedAppointments ?? []).map((b) => `${b.appointment_date}|${b.start_time}`)
    )

    // 3. Expand each recurring slot window into individual appointment slots
    const seen = new Set<string>()
    const result: Array<{
      date: string
      startTime: string
      endTime: string
      duration: number
      period: "morning" | "afternoon" | "evening"
      formattedStart: string
      formattedEnd: string
      isBooked: boolean
    }> = []

    for (const slot of timeSlots) {
      const date = datesByDow.get(slot.day_of_week)
      if (!date) continue

      const startMins = timeToMinutes(slot.start_time)
      const endMins = timeToMinutes(slot.end_time)
      const duration = slot.appointment_duration ?? 30

      for (let cur = startMins; cur + duration <= endMins; cur += duration) {
        const startTime = minutesToTime(cur)
        const endTime = minutesToTime(cur + duration)
        const key = `${date}|${startTime}`

        if (seen.has(key)) continue
        seen.add(key)

        result.push({
          date,
          startTime,
          endTime,
          duration,
          period: getTimePeriod(startTime),
          formattedStart: formatTime12h(startTime),
          formattedEnd: formatTime12h(endTime),
          isBooked: bookedSet.has(key),
        })
      }
    }

    // 4. Sort by date then start time
    result.sort((a, b) => {
      const d = a.date.localeCompare(b.date)
      return d !== 0 ? d : a.startTime.localeCompare(b.startTime)
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error("[available-slots]", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}