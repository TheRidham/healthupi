"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, LoaderCircle } from "lucide-react"
import { addDays, format, startOfToday, getDay } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

export type AvailableSlot = {
  date: string
  startTime: string
  endTime: string
  duration: number
  period: "morning" | "afternoon" | "evening"
  formattedStart: string
  formattedEnd: string
  isBooked: boolean
}

export type SelectedSlot = {
  date: string
  startTime: string
  endTime: string
  duration: number
  dayOfWeek: number
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimeSlotSelectorProps {
  doctorId: string
  selectedServices: Array<{ id: string; name: string; fee?: number }>
  onSlotSelected: (slot: SelectedSlot) => void
  onBack: () => void
  onCancel: () => void
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const PERIOD_LABELS = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" }

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimeSlotSelector({
  doctorId,
  selectedServices,
  onSlotSelected,
  onBack,
  onCancel,
}: TimeSlotSelectorProps) {
  const today = startOfToday()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allSlots, setAllSlots] = useState<AvailableSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(format(today, "yyyy-MM-dd"))
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/appointments/available-slots?doctorId=${doctorId}`)
        const data = await res.json()
        if (data.success) {
          setAllSlots(data.data ?? [])
        } else {
          setError(data.error || "Failed to load time slots")
        }
      } catch {
        setError("Error loading slots")
      } finally {
        setLoading(false)
      }
    }
    fetchSlots()
  }, [doctorId])

  // 7-day date range
  const dateRange = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i)
    return {
      date,
      dateStr: format(date, "yyyy-MM-dd"),
      dayName: DAYS[getDay(date)],
      dayNum: format(date, "d"),
    }
  })

  // Available (not booked) slot count per date for the date grid badge
  const availableCountByDate = new Map<string, number>()
  allSlots.forEach((s) => {
    if (!s.isBooked) {
      availableCountByDate.set(s.date, (availableCountByDate.get(s.date) ?? 0) + 1)
    }
  })

  // All slots for selected date — booked ones shown as disabled
  const slotsForDate = allSlots.filter((s) => s.date === selectedDate)
  const slotsByPeriod = {
    morning: slotsForDate.filter((s) => s.period === "morning"),
    afternoon: slotsForDate.filter((s) => s.period === "afternoon"),
    evening: slotsForDate.filter((s) => s.period === "evening"),
  }

  const handleContinue = () => {
    if (!selectedSlot) {
      setError("Please select a time slot")
      return
    }
    setError(null)
    onSlotSelected({
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      duration: selectedSlot.duration,
      dayOfWeek: getDay(new Date(selectedSlot.date)),
    })
  }

  // ── States ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Card className="p-8 mb-8">
        <div className="flex items-center justify-center gap-3">
          <LoaderCircle className="w-5 h-5 animate-spin text-primary" />
          <p className="text-foreground/60">Loading available time slots...</p>
        </div>
      </Card>
    )
  }

  if (error && allSlots.length === 0) {
    return (
      <Card className="p-8 mb-8 border-destructive/50 bg-destructive/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground mb-2">{error}</p>
            <Button onClick={onBack} variant="outline" size="sm">Go Back</Button>
          </div>
        </div>
      </Card>
    )
  }

  if (allSlots.length === 0) {
    return (
      <Card className="p-8 mb-8">
        <div className="text-center">
          <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground/60 mb-4">No available slots for the next 7 days</p>
          <Button onClick={onBack} variant="outline">Go Back</Button>
        </div>
      </Card>
    )
  }

  // ── Main ─────────────────────────────────────────────────────────────────

  return (
    <Card className="p-6 sm:p-8 mb-8 border-primary/30 bg-card">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Pick Date & Time</h2>
        <p className="text-foreground/70">Select an available time slot for your appointment</p>
      </div>

      {/* Week label */}
      <p className="text-sm font-semibold text-foreground mb-4">
        {format(dateRange[0].date, "MMM d")} – {format(dateRange[6].date, "MMM d, yyyy")}
      </p>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-8">
        {dateRange.map(({ date, dateStr, dayName, dayNum }) => {
          const count = availableCountByDate.get(dateStr) ?? 0
          const isSelected = selectedDate === dateStr
          const hasSlots = count > 0

          return (
            <button
              key={dateStr}
              onClick={() => {
                setSelectedDate(dateStr)
                setSelectedSlot(null)
              }}
              className={`p-2 rounded-xl border-2 transition text-center ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : hasSlots
                  ? "border-border bg-card text-foreground hover:border-primary/50"
                  : "border-border bg-muted/30 text-muted-foreground opacity-50"
              }`}
            >
              <div className="text-[10px] tracking-wide mb-0.5">{dayName}</div>
              <div className="text-base font-bold leading-none">{dayNum}</div>
              <div className={`text-[10px] mt-1 ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {hasSlots ? count : "—"}
              </div>
            </button>
          )
        })}
      </div>

      {/* Time slots */}
      {slotsForDate.length === 0 ? (
        <div className="text-center py-10 mb-8">
          <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-foreground/60 text-sm">No slots for this date</p>
        </div>
      ) : (
        <div className="mb-8 space-y-6">
          <p className="text-sm text-foreground/60">
            {format(new Date(selectedDate), "EEEE, MMMM d")} ·{" "}
            <span className="font-semibold text-foreground">
              {slotsForDate.filter((s) => !s.isBooked).length} available
            </span>
            {slotsForDate.some((s) => s.isBooked) && (
              <span className="ml-2 text-muted-foreground">
                · {slotsForDate.filter((s) => s.isBooked).length} booked
              </span>
            )}
          </p>

          {(["morning", "afternoon", "evening"] as const).map((period) => {
            const slots = slotsByPeriod[period]
            if (slots.length === 0) return null

            return (
              <div key={period}>
                <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                  {PERIOD_LABELS[period]}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {slots.map((slot, idx) => {
                    const isActive =
                      selectedSlot?.startTime === slot.startTime &&
                      selectedSlot?.date === slot.date

                    return (
                      <button
                        key={`${slot.date}-${slot.startTime}-${idx}`}
                        onClick={() => !slot.isBooked && setSelectedSlot(slot)}
                        disabled={slot.isBooked}
                        className={`p-3 rounded-xl border-2 transition text-sm font-medium text-center
                          ${slot.isBooked
                            ? "border-border bg-muted/40 text-muted-foreground cursor-not-allowed opacity-50"
                            : isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                          }`}
                      >
                        <div>{slot.formattedStart}</div>
                        <div className="text-xs opacity-70 mt-0.5">
                          {slot.isBooked ? "Booked" : `${slot.duration}m`}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Selected slot summary */}
      {selectedSlot && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-primary text-primary-foreground shrink-0">
              {selectedServices[0]?.name || "Service"}
            </Badge>
            <div className="flex-1 min-w-0 text-sm">
              <p className="font-semibold text-foreground">
                {format(new Date(selectedSlot.date), "MMM d, yyyy")} ·{" "}
                {selectedSlot.formattedStart} – {selectedSlot.formattedEnd}
              </p>
              <p className="text-foreground/60">{selectedSlot.duration} mins</p>
            </div>
            {selectedServices[0]?.fee != null && (
              <p className="font-bold text-primary text-lg shrink-0">
                ₹{selectedServices[0].fee.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Inline error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onCancel} variant="outline" className="flex-1 py-6">
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedSlot}
          className="flex-1 py-6 font-semibold"
        >
          Continue →
        </Button>
      </div>
    </Card>
  )
}