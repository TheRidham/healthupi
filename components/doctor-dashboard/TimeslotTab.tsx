"use client"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Clock,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Sparkles,
  CalendarDays,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { addDays, format, startOfToday, isSameDay } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  appointment_duration: number
  is_available: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function timeToMinutes(time: string): number {
  const [h, m] = (time || "00:00:00").split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`
}

function formatTimeForDisplay(time: string | null) {
  if (!time) return "--:--"
  const [h, m] = time.split(":").map(Number)
  const hour12 = h % 12 || 12
  const ampm = h >= 12 ? "PM" : "AM"
  return `${hour12}:${(m || 0).toString().padStart(2, "0")} ${ampm}`
}

function to24Hour(hour12: number, ampm: string): number {
  if (ampm === "AM") return hour12 === 12 ? 0 : hour12
  return hour12 === 12 ? 12 : hour12 + 12
}

function formatTime12hInput(time: string): { hour: string; min: string; ampm: string } {
  const [h, m] = (time || "09:00").split(":").map(Number)
  const hour12 = h % 12 || 12
  return {
    hour: hour12.toString(),
    min: (m || 0).toString().padStart(2, "0"),
    ampm: h >= 12 ? "PM" : "AM",
  }
}

function formatTimeShort(time: string) {
  const [h, m] = time.split(":")
  const hour = parseInt(h)
  const ampm = hour >= 12 ? "pm" : "am"
  const h12 = hour % 12 || 12
  return m === "00" ? `${h12}${ampm}` : `${h12}:${m}${ampm}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimeSlotsTab() {
  const today = startOfToday()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(today.getDay())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [overlapError, setOverlapError] = useState("")

  const [newSlot, setNewSlot] = useState({
    day_of_week: today.getDay(),
    start_time: "09:00:00",
    end_time: "12:00:00",
    appointment_duration: 30,
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/dashboard/timeslots")
      .then((r) => r.json())
      .then((res) => { if (res.success) setSlots(res.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Computed ───────────────────────────────────────────────────────────────

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = addDays(today, weekOffset * 7 + i)
      return {
        abbrev: DAYS[dayDate.getDay()],
        full: DAYS[dayDate.getDay()],
        dayNum: dayDate.getDay(),
        date: dayDate,
        dayNumber: format(dayDate, "d"),
        month: format(dayDate, "MMM"),
        isToday: isSameDay(dayDate, today),
      }
    })
  }, [today, weekOffset])

  const getSlotsForDay = (dayIndex: number) =>
    slots
      .filter((s) => s.day_of_week === dayIndex)
      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))

  const getTotalHoursThisWeek = () => {
    const totalMins = slots.reduce((acc, slot) => {
      return acc + (timeToMinutes(slot.end_time) - timeToMinutes(slot.start_time))
    }, 0)
    const hrs = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
  }

  const getTotalPatientsThisWeek = () =>
    slots.reduce((acc, slot) => {
      const window = timeToMinutes(slot.end_time) - timeToMinutes(slot.start_time)
      return acc + Math.floor(window / (slot.appointment_duration || 30))
    }, 0)

  const getSlotDuration = (slot: TimeSlot) => {
    const mins = timeToMinutes(slot.end_time) - timeToMinutes(slot.start_time)
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60)
      const rem = mins % 60
      return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
    }
    return `${mins}m`
  }

  const getSlotDurationPreview = () => {
    const start = timeToMinutes(newSlot.start_time)
    const end = timeToMinutes(newSlot.end_time)
    if (isNaN(start) || isNaN(end) || end <= start) return "Invalid"
    const mins = end - start
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60)
      const rem = mins % 60
      return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
    }
    return `${mins}m`
  }

  const getEstimatedPatients = () => {
    const window = timeToMinutes(newSlot.end_time) - timeToMinutes(newSlot.start_time)
    if (window <= 0 || !newSlot.appointment_duration) return 0
    return Math.floor(window / newSlot.appointment_duration)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddSlot = async () => {
    setOverlapError("")
    const startMins = timeToMinutes(newSlot.start_time)
    const endMins = timeToMinutes(newSlot.end_time)

    if (isNaN(startMins) || isNaN(endMins)) {
      setOverlapError("Please enter valid times")
      return
    }
    if (endMins <= startMins) {
      setOverlapError("End time must be after start time")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/dashboard/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_of_week: newSlot.day_of_week,
          start_time: minutesToTime(startMins),
          end_time: minutesToTime(endMins),
          appointment_duration: newSlot.appointment_duration,
          is_available: true,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setSlots((prev) => [...prev, result.data])
        setNewSlot({ day_of_week: selectedDayIndex, start_time: "09:00:00", end_time: "12:00:00", appointment_duration: 30 })
        setIsAddDialogOpen(false)
      } else {
        setOverlapError(result.error || "Failed to add slot")
      }
    } catch {
      setOverlapError("Failed to add slot")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const res = await fetch(`/api/dashboard/timeslots?slot_id=${slotId}`, { method: "DELETE" })
      const result = await res.json()
      if (result.success) setSlots((prev) => prev.filter((s) => s.id !== slotId))
    } catch {}
  }

  const handleApplyTemplate = async (template: string) => {
    setSaving(true)
    const templates: Record<string, { day_of_week: number; start_time: string; end_time: string }[]> = {
      "weekdays-m-f": [1, 2, 3, 4, 5].map((d) => ({ day_of_week: d, start_time: "09:00:00", end_time: "17:00:00" })),
      "mon-wed-fri": [1, 3, 5].map((d) => ({ day_of_week: d, start_time: "09:00:00", end_time: "14:00:00" })),
      "morning-only": [0, 1, 2, 3, 4, 5, 6].map((d) => ({ day_of_week: d, start_time: "08:00:00", end_time: "12:00:00" })),
      "evening-only": [0, 1, 2, 3, 4, 5, 6].map((d) => ({ day_of_week: d, start_time: "16:00:00", end_time: "20:00:00" })),
      "sat-only": [{ day_of_week: 6, start_time: "10:00:00", end_time: "16:00:00" }],
    }

    try {
      for (const slot of templates[template] ?? []) {
        await fetch("/api/dashboard/timeslots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...slot, appointment_duration: 30, is_available: true }),
        })
      }
      const res = await fetch("/api/dashboard/timeslots")
      const result = await res.json()
      if (result.success) setSlots(result.data)
    } catch {}
    finally {
      setSaving(false)
      setIsTemplateDialogOpen(false)
    }
  }

  // ── Time picker helpers (inline to keep state local) ───────────────────────

  const TimePickerWidget = ({
    value,
    onChange,
  }: {
    value: string
    onChange: (val: string) => void
  }) => {
    const t = formatTime12hInput(value)
    const [hStr, mStr] = value.split(":")

    const adjustHour = (delta: number) => {
      const current = parseInt(t.hour) || 9
      const next = ((current - 1 + delta + 12) % 12) + 1
      onChange(`${to24Hour(next, t.ampm).toString().padStart(2, "0")}:${mStr || "00"}:00`)
    }

    const adjustMin = (delta: number) => {
      const m = parseInt(mStr) || 0
      const steps = [0, 15, 30, 45]
      const idx = steps.indexOf(m)
      const nextIdx = (idx === -1 ? 0 : (idx + delta + 4) % 4)
      onChange(`${hStr.padStart(2, "0")}:${steps[nextIdx].toString().padStart(2, "0")}:00`)
    }

    const toggleAmPm = () => {
      const newAmpm = t.ampm === "AM" ? "PM" : "AM"
      onChange(`${to24Hour(parseInt(t.hour) || 9, newAmpm).toString().padStart(2, "0")}:${mStr || "00"}:00`)
    }

    const Spinner = ({ label, onUp, onDown }: { label: string; onUp: () => void; onDown: () => void }) => (
      <div className="flex flex-col items-center">
        <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={onUp}><ChevronUp className="size-3" /></button>
        <div className="w-8 h-8 flex items-center justify-center font-mono text-sm font-bold bg-background rounded border border-gray-100">{label}</div>
        <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={onDown}><ChevronDown className="size-3" /></button>
      </div>
    )

    return (
      <div className="flex items-center gap-1.5 bg-muted/40 rounded-xl p-2">
        <Spinner label={t.hour} onUp={() => adjustHour(1)} onDown={() => adjustHour(-1)} />
        <span className="font-bold text-sm pb-0.5">:</span>
        <Spinner label={t.min} onUp={() => adjustMin(1)} onDown={() => adjustMin(-1)} />
        <button
          type="button"
          onClick={toggleAmPm}
          className="ml-1 px-2 py-1 text-xs font-bold bg-background rounded border border-gray-100 hover:bg-muted"
        >
          {t.ampm}
        </button>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const selectedDay = days.find((d) => d.dayNum === selectedDayIndex) || days[0]
  const selectedDaySlots = getSlotsForDay(selectedDayIndex)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Availability</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {getTotalHoursThisWeek()} · ~{getTotalPatientsThisWeek()} patients/week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsTemplateDialogOpen(true)} disabled={saving}>
            <Wand2 className="w-4 h-4 mr-1" /> Templates
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={saving}>
                <Plus className="w-4 h-4 mr-1" /> Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" /> Add Time Slot
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Day Selector */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 uppercase tracking-wide">Select Day</Label>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => (
                      <button
                        key={day.dayNum}
                        type="button"
                        onClick={() => setNewSlot({ ...newSlot, day_of_week: day.dayNum })}
                        className={`p-2 rounded-lg text-center transition-all ${
                          newSlot.day_of_week === day.dayNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <div className="text-[10px] opacity-70">{day.abbrev}</div>
                        <div className="text-sm font-bold">{day.dayNumber}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Pickers */}
                <div className="space-y-3">
                  <Label className="text-xs text-gray-400 uppercase tracking-wide">Time Slot</Label>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-400">Start</span>
                      <TimePickerWidget
                        value={newSlot.start_time}
                        onChange={(val) => setNewSlot((prev) => ({ ...prev, start_time: val }))}
                      />
                    </div>
                    <span className="text-xl text-gray-300 font-bold mt-4">→</span>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-400">End</span>
                      <TimePickerWidget
                        value={newSlot.end_time}
                        onChange={(val) => setNewSlot((prev) => ({ ...prev, end_time: val }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="text-sm px-4 py-1">
                      Window: {getSlotDurationPreview()}
                    </Badge>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400 uppercase tracking-wide">Time per Patient</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setNewSlot({ ...newSlot, appointment_duration: d })}
                        className={`p-2 rounded-lg text-center text-xs font-medium transition-all ${
                          newSlot.appointment_duration === d
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    ~<span className="font-semibold text-blue-600">{getEstimatedPatients()}</span> appointments possible
                  </p>
                </div>

                {overlapError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {overlapError}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSlot} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  Add Slot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> Quick Templates
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {[
              { label: "Mon – Fri Full Day", sub: "9 AM – 5 PM", key: "weekdays-m-f" },
              { label: "Mon, Wed, Fri", sub: "9 AM – 2 PM", key: "mon-wed-fri" },
              { label: "Morning Only (Daily)", sub: "8 AM – 12 PM", key: "morning-only" },
              { label: "Evening Only (Daily)", sub: "4 PM – 8 PM", key: "evening-only" },
              { label: "Saturday Only", sub: "10 AM – 4 PM", key: "sat-only" },
            ].map((t) => (
              <Button
                key={t.key}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => handleApplyTemplate(t.key)}
                disabled={saving}
              >
                <div className="text-left">
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-gray-400">{t.sub}</div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-gray-100 rounded-xl p-2">
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((p) => Math.max(0, p - 1))} disabled={weekOffset === 0}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <CalendarDays className="w-4 h-4" />
          {days[0].month} {days[0].dayNumber} – {days[6].month} {days[6].dayNumber}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((p) => p + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySlots = getSlotsForDay(day.dayNum)
          const isSelected = selectedDayIndex === day.dayNum
          return (
            <div
              key={day.dayNum}
              onClick={() => setSelectedDayIndex(day.dayNum)}
              className={`cursor-pointer rounded-xl border p-2 text-center transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : day.isToday
                  ? "border-blue-200 bg-blue-50/50"
                  : daySlots.length > 0
                  ? "border-gray-200 bg-white hover:border-blue-300"
                  : "border-dashed border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`text-[10px] font-semibold uppercase ${day.isToday ? "text-blue-600" : "text-gray-400"}`}>
                {day.abbrev}
              </div>
              <div className={`text-xl font-bold my-1 ${day.isToday || isSelected ? "text-blue-600" : "text-gray-800"}`}>
                {day.dayNumber}
              </div>
              {daySlots.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  {daySlots.slice(0, 2).map((slot) => (
                    <div key={slot.id} className="text-[9px] bg-blue-500 text-white rounded px-1 py-0.5 truncate">
                      {formatTimeShort(slot.start_time)}–{formatTimeShort(slot.end_time)}
                    </div>
                  ))}
                  {daySlots.length > 2 && (
                    <div className="text-[9px] font-medium text-blue-500">+{daySlots.length - 2}</div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-gray-300">+ Add</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Day Detail */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">{selectedDay.full}</span>
            <Badge variant="outline" className="text-xs">{selectedDaySlots.length} slots</Badge>
            {selectedDay.isToday && <Badge className="text-xs bg-blue-600 text-white">Today</Badge>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setNewSlot({ day_of_week: selectedDayIndex, start_time: "09:00:00", end_time: "12:00:00", appointment_duration: 30 })
              setIsAddDialogOpen(true)
            }}
          >
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>

        {selectedDaySlots.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedDaySlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 group hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatTimeForDisplay(slot.start_time)} – {formatTimeForDisplay(slot.end_time)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getSlotDuration(slot)} · {slot.appointment_duration}m per patient
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                  onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id) }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">No slots for this day</p>
          </div>
        )}
      </div>
    </div>
  )
}