"use client"

import { useState, useMemo, useEffect } from "react"
import { usePathname } from "next/navigation"
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
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { addDays, format, startOfToday, isSameDay } from "date-fns"

interface TimeSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  appointment_duration: number
  is_available: boolean
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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

function parseTimeInput(value: string): string {
  const cleaned = value.replace(/[^0-9]/g, "")
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 4) {
    const h = cleaned.slice(0, -2)
    const m = cleaned.slice(-2)
    return `${h.padStart(2, "0")}:${m}`
  }
  return cleaned.slice(0, 4).padStart(5, "0")
}

function formatTime12hInput(time: string): { hour: string; min: string; ampm: string } {
  const [h, m] = (time || "09:00").split(":").map(Number)
  const hour12 = h % 12 || 12
  return {
    hour: hour12.toString(),
    min: (m || 0).toString().padStart(2, "0"),
    ampm: h >= 12 ? "PM" : "AM"
  }
}

export function TimeSlots() {
  const pathname = usePathname()
  const doctorId = pathname?.split('/')[2] || ''
  
  const today = startOfToday()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(today.getDay())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [pendingSlots, setPendingSlots] = useState<TimeSlot[]>([])
  const [overlapError, setOverlapError] = useState("")
  
  const [newSlot, setNewSlot] = useState({ 
    day_of_week: today.getDay(), 
    start_time: "09:00:00", 
    end_time: "12:00:00", 
    appointment_duration: 30 
  })

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!doctorId) return
      
      try {
        const response = await fetch(`/api/doctor/${doctorId}/timeslots`)
        const result = await response.json()
        
        if (result.success && result.data.timeSlots) {
          setSlots(result.data.timeSlots)
        }
      } catch (err) {
        console.error('[TimeSlots] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTimeSlots()
  }, [doctorId])

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = addDays(today, weekOffset * 7 + i)
      return {
        abbrev: DAY_ABBREVS[dayDate.getDay()],
        full: DAYS[dayDate.getDay()],
        dayNum: dayDate.getDay(),
        fullDate: format(dayDate, "MMMM d, yyyy"),
        date: dayDate,
        dayNumber: format(dayDate, "d"),
        month: format(dayDate, "MMM"),
        isToday: isSameDay(dayDate, today),
      }
    })
  }, [today, weekOffset])

  const getSlotsForDay = (dayIndex: number) => {
    return slots.filter((s) => s.day_of_week === dayIndex).sort((a, b) => 
      (a.start_time || "").localeCompare(b.start_time || "")
    )
  }

  const getTotalHoursThisWeek = () => {
    const totalMins = slots.reduce((acc, slot) => {
      const start = timeToMinutes(slot.start_time)
      const end = timeToMinutes(slot.end_time)
      return acc + (end - start)
    }, 0)
    const hrs = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
  }

  const getTotalPatientsThisWeek = () => {
    return slots.reduce((acc, slot) => {
      const start = timeToMinutes(slot.start_time)
      const end = timeToMinutes(slot.end_time)
      const windowMins = end - start
      const duration = slot.appointment_duration || 30
      return acc + Math.floor(windowMins / duration)
    }, 0)
  }

  const getSlotDuration = (slot: TimeSlot) => {
    const start = timeToMinutes(slot.start_time)
    const end = timeToMinutes(slot.end_time)
    const mins = end - start
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60)
      const remainMins = mins % 60
      return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`
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
      const remainMins = mins % 60
      return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`
    }
    return `${mins}m`
  }

  const getEstimatedPatients = () => {
    const start = timeToMinutes(newSlot.start_time)
    const end = timeToMinutes(newSlot.end_time)
    const duration = newSlot.appointment_duration || 30
    const windowMins = end - start
    if (windowMins <= 0 || duration <= 0) return 0
    return Math.floor(windowMins / duration)
  }

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
      const response = await fetch(`/api/doctor/${doctorId}/timeslots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: newSlot.day_of_week,
          start_time: minutesToTime(startMins),
          end_time: minutesToTime(endMins),
          appointment_duration: newSlot.appointment_duration,
          is_available: true,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSlots(prev => [...prev, result.data])
        setNewSlot({ 
          day_of_week: selectedDayIndex, 
          start_time: "09:00:00", 
          end_time: "12:00:00", 
          appointment_duration: 30 
        })
        setIsAddDialogOpen(false)
      } else {
        setOverlapError(result.error || 'Failed to add slot')
      }
    } catch (err) {
      console.error('[TimeSlots] Error adding slot:', err)
      setOverlapError('Failed to add slot')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const response = await fetch(`/api/doctor/${doctorId}/timeslots?slot_id=${slotId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSlots(prev => prev.filter(s => s.id !== slotId))
      }
    } catch (err) {
      console.error('[TimeSlots] Error deleting slot:', err)
    }
  }

  const handleApplyTemplate = async (template: string) => {
    setSaving(true)
    
    const templates: Record<string, { day_of_week: number; start_time: string; end_time: string }[]> = {
      'weekdays-m-f': [
        { day_of_week: 1, start_time: '09:00:00', end_time: '17:00:00' },
        { day_of_week: 2, start_time: '09:00:00', end_time: '17:00:00' },
        { day_of_week: 3, start_time: '09:00:00', end_time: '17:00:00' },
        { day_of_week: 4, start_time: '09:00:00', end_time: '17:00:00' },
        { day_of_week: 5, start_time: '09:00:00', end_time: '17:00:00' },
      ],
      'mon-wed-fri': [
        { day_of_week: 1, start_time: '09:00:00', end_time: '14:00:00' },
        { day_of_week: 3, start_time: '09:00:00', end_time: '14:00:00' },
        { day_of_week: 5, start_time: '09:00:00', end_time: '14:00:00' },
      ],
      'morning-only': DAYS.map((_, i) => ({ day_of_week: i, start_time: '08:00:00', end_time: '12:00:00' })),
      'evening-only': DAYS.map((_, i) => ({ day_of_week: i, start_time: '16:00:00', end_time: '20:00:00' })),
      'sat-only': [{ day_of_week: 6, start_time: '10:00:00', end_time: '16:00:00' }],
    }

    const templateSlots = templates[template] || []
    
    try {
      for (const slot of templateSlots) {
        await fetch(`/api/doctor/${doctorId}/timeslots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...slot,
            appointment_duration: 30,
            is_available: true,
          }),
        })
      }
      
      // Refresh slots
      const response = await fetch(`/api/doctor/${doctorId}/timeslots`)
      const result = await response.json()
      if (result.success) {
        setSlots(result.data.timeSlots || [])
      }
    } catch (err) {
      console.error('[TimeSlots] Error applying template:', err)
    } finally {
      setSaving(false)
      setIsTemplateDialogOpen(false)
    }
  }

  const selectedDay = days.find(d => d.dayNum === selectedDayIndex) || days[0]
  const selectedDaySlots = getSlotsForDay(selectedDayIndex)

  const handleDayClick = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex)
  }

  const formatTimeShort = (time: string) => {
    const [h, m] = time.split(":")
    const hour = parseInt(h)
    const ampm = hour >= 12 ? "pm" : "am"
    const h12 = hour % 12 || 12
    return m === "00" ? `${h12}${ampm}` : `${h12}:${m}${ampm}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Availability</h3>
            <Badge variant="secondary" className="text-xs">
              {slots.length} slots
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {getTotalHoursThisWeek()} · ~{getTotalPatientsThisWeek()} patients this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsTemplateDialogOpen(true)}
            disabled={saving}
          >
            <Wand2 className="size-4 mr-1" />
            Templates
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={saving}>
                <Plus className="size-4 mr-1" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSlot()
            }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-primary" />
                  Add Time Slot
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-5 py-4">
                {/* Day Selector */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Select Day</Label>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => (
                      <button
                        key={day.dayNum}
                        type="button"
                        onClick={() => setNewSlot({ ...newSlot, day_of_week: day.dayNum })}
                        className={`p-2 rounded-lg text-center transition-all ${
                          newSlot.day_of_week === day.dayNum
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        <div className="text-[10px] opacity-70">{day.abbrev}</div>
                        <div className="text-sm font-bold">{day.dayNumber}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Inputs */}
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Time Slot</Label>
                  <div className="flex items-center justify-center gap-3 bg-muted/30 rounded-xl p-4">
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] text-muted-foreground mb-1">Start</div>
                      {(() => {
                        const t = formatTime12hInput(newSlot.start_time)
                        return (
                          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                            <div className="flex flex-col items-center">
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const current = parseInt(t.hour) || 9
                                const next = current >= 12 ? 1 : current + 1
                                const h24 = to24Hour(next, t.ampm)
                                setNewSlot(prev => ({ ...prev, start_time: `${h24.toString().padStart(2,"0")}:${prev.start_time.split(":")[1] || "00"}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <Input value={t.hour} onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, "").slice(-2)
                                if (v !== "") {
                                  const num = parseInt(v)
                                  if (num >= 1 && num <= 12) {
                                    const h24 = to24Hour(num, t.ampm)
                                    setNewSlot(prev => ({ ...prev, start_time: `${h24.toString().padStart(2,"0")}:${prev.start_time.split(":")[1] || "00"}` }))
                                  }
                                }
                              }} className="w-8 h-8 text-center font-mono text-sm font-bold p-1" />
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const current = parseInt(t.hour) || 9
                                const next = current <= 1 ? 12 : current - 1
                                const h24 = to24Hour(next, t.ampm)
                                setNewSlot(prev => ({ ...prev, start_time: `${h24.toString().padStart(2,"0")}:${prev.start_time.split(":")[1] || "00"}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                            <span className="font-bold text-sm">:</span>
                            <div className="flex flex-col items-center">
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const [, m] = (newSlot.start_time || "09:00").split(":").map(Number)
                                const next = m >= 45 ? 0 : m + 15
                                setNewSlot(prev => ({ ...prev, start_time: `${prev.start_time.split(":")[0].padStart(2,"0")}:${next.toString().padStart(2,"0")}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <Input value={t.min} className="w-8 h-8 text-center font-mono text-sm font-bold p-1" readOnly />
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const [, m] = (newSlot.start_time || "09:00").split(":").map(Number)
                                const next = m <= 0 ? 45 : m - 15
                                setNewSlot(prev => ({ ...prev, start_time: `${prev.start_time.split(":")[0].padStart(2,"0")}:${next.toString().padStart(2,"0")}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                            <div className="flex flex-col items-center ml-1">
                              <button type="button" className="p-0.5 hover:bg-muted rounded text-xs font-bold" onClick={() => {
                                const newAmpm = t.ampm === "AM" ? "PM" : "AM"
                                const h24 = to24Hour(parseInt(t.hour) || 9, newAmpm)
                                setNewSlot(prev => ({ ...prev, start_time: `${h24.toString().padStart(2,"0")}:${prev.start_time.split(":")[1] || "00"}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <div className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-muted rounded">{t.ampm}</div>
                              <button type="button" className="p-0.5 hover:bg-muted rounded text-xs font-bold" onClick={() => {
                                const newAmpm = t.ampm === "AM" ? "PM" : "AM"
                                const h24 = to24Hour(parseInt(t.hour) || 9, newAmpm)
                                setNewSlot(prev => ({ ...prev, start_time: `${h24.toString().padStart(2,"0")}:${prev.start_time.split(":")[1] || "00"}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                    
                    <div className="text-2xl text-muted-foreground font-bold self-end mb-4">→</div>
                    
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] text-muted-foreground mb-1">End</div>
                      {(() => {
                        const t = formatTime12hInput(newSlot.end_time)
                        return (
                          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                            <div className="flex flex-col items-center">
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const current = parseInt(t.hour) || 12
                                const next = current >= 12 ? 1 : current + 1
                                const h24 = to24Hour(next, t.ampm)
                                setNewSlot(prev => ({ ...prev, end_time: `${h24.toString().padStart(2,"0")}:${prev.end_time.split(":")[1] || "00"}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <Input value={t.hour} onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, "").slice(-2)
                                if (v !== "") {
                                  const num = parseInt(v)
                                  if (num >= 1 && num <= 12) {
                                    const h24 = to24Hour(num, t.ampm)
                                    setNewSlot(prev => ({ ...prev, end_time: `${h24.toString().padStart(2,"0")}:${prev.end_time.split(":")[1] || "00"}` }))
                                  }
                                }
                              }} className="w-8 h-8 text-center font-mono text-sm font-bold p-1" />
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const current = parseInt(t.hour) || 12
                                const next = current <= 1 ? 12 : current - 1
                                const h24 = to24Hour(next, t.ampm)
                                setNewSlot(prev => ({ ...prev, end_time: `${h24.toString().padStart(2,"0")}:${prev.end_time.split(":")[1] || "00"}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                            <span className="font-bold text-sm">:</span>
                            <div className="flex flex-col items-center">
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const [, m] = (newSlot.end_time || "12:00").split(":").map(Number)
                                const next = m >= 45 ? 0 : m + 15
                                setNewSlot(prev => ({ ...prev, end_time: `${prev.end_time.split(":")[0].padStart(2,"0")}:${next.toString().padStart(2,"0")}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <Input value={t.min} className="w-8 h-8 text-center font-mono text-sm font-bold p-1" readOnly />
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const [, m] = (newSlot.end_time || "12:00").split(":").map(Number)
                                const next = m <= 0 ? 45 : m - 15
                                setNewSlot(prev => ({ ...prev, end_time: `${prev.end_time.split(":")[0].padStart(2,"0")}:${next.toString().padStart(2,"0")}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                            <div className="flex flex-col items-center ml-1">
                              <button type="button" className="p-0.5 hover:bg-muted rounded text-xs font-bold" onClick={() => {
                                const newAmpm = t.ampm === "AM" ? "PM" : "AM"
                                const h24 = to24Hour(parseInt(t.hour) || 12, newAmpm)
                                setNewSlot(prev => ({ ...prev, end_time: `${h24.toString().padStart(2,"0")}:${prev.end_time.split(":")[1] || "00"}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <div className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-muted rounded">{t.ampm}</div>
                              <button type="button" className="p-0.5 hover:bg-muted rounded text-xs font-bold" onClick={() => {
                                const newAmpm = t.ampm === "AM" ? "PM" : "AM"
                                const h24 = to24Hour(parseInt(t.hour) || 12, newAmpm)
                                setNewSlot(prev => ({ ...prev, end_time: `${h24.toString().padStart(2,"0")}:${prev.end_time.split(":")[1] || "00"}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Badge variant="outline" className="text-sm px-4 py-1 bg-muted/30">
                      Window: {getSlotDurationPreview()}
                    </Badge>
                  </div>
                </div>

                {/* Appointment Duration */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Time per Patient
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[{ value: 15, label: "15 min" }, { value: 30, label: "30 min" }, { value: 45, label: "45 min" }, { value: 60, label: "60 min" }].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewSlot({ ...newSlot, appointment_duration: opt.value })}
                        className={`p-2 rounded-lg text-center text-xs font-medium transition-all ${
                          newSlot.appointment_duration === opt.value
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Estimated <span className="font-semibold text-primary">{getEstimatedPatients()}</span> appointment(s) possible
                  </p>
                </div>

                {overlapError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="size-4 shrink-0" />
                    {overlapError}
                  </div>
                )}
              </div>
              
              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleAddSlot} disabled={saving} className="w-full sm:w-auto">
                  {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
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
              <Sparkles className="size-5 text-primary" />
              Quick Templates
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {[
              { label: "Mon - Fri Full Day", sub: "9 AM - 5 PM", template: "weekdays-m-f" },
              { label: "Mon, Wed, Fri", sub: "9 AM - 2 PM", template: "mon-wed-fri" },
              { label: "Morning Only (Daily)", sub: "8 AM - 12 PM", template: "morning-only" },
              { label: "Evening Only (Daily)", sub: "4 PM - 8 PM", template: "evening-only" },
              { label: "Saturday Only", sub: "10 AM - 4 PM", template: "sat-only" },
            ].map((template) => (
              <Button
                key={template.template}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => handleApplyTemplate(template.template)}
                disabled={saving}
              >
                <div className="text-left">
                  <div className="font-medium">{template.label}</div>
                  <div className="text-xs text-muted-foreground">{template.sub}</div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((p) => Math.max(0, p - 1))} disabled={weekOffset === 0}>
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {days[0].month} {days[0].dayNumber} - {days[6].month} {days[6].dayNumber}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((p) => p + 1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySlots = getSlotsForDay(day.dayNum)
          const hasSlots = daySlots.length > 0
          const isSelected = selectedDayIndex === day.dayNum
          
          return (
            <Card 
              key={day.dayNum}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30" 
                  : day.isToday 
                    ? "border-primary/50 bg-primary/5" 
                    : hasSlots 
                      ? "border-muted-foreground/20 hover:border-primary/40" 
                      : "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
              }`}
              onClick={() => handleDayClick(day.dayNum)}
            >
              <CardContent className="p-2 text-center">
                <div className={`text-xs font-semibold uppercase tracking-wide ${day.isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {day.abbrev}
                </div>
                <div className={`text-2xl font-bold my-1 ${day.isToday || isSelected ? "text-primary" : ""}`}>
                  {day.dayNumber}
                </div>
                {hasSlots ? (
                  <div className="flex flex-col gap-0.5">
                    {daySlots.slice(0, 2).map((slot) => (
                      <div 
                        key={slot.id}
                        className="text-[9px] bg-primary/80 text-primary-foreground rounded px-1 py-0.5 truncate"
                      >
                        {formatTimeShort(slot.start_time)}-{formatTimeShort(slot.end_time)}
                      </div>
                    ))}
                    {daySlots.length > 2 && (
                      <div className="text-[9px] font-medium text-primary">
                        +{daySlots.length - 2} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground/60">
                    + Add
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Day Details */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              {selectedDay.full}
              <Badge variant="outline" className="text-xs">
                {selectedDaySlots.length} slots
              </Badge>
              {selectedDay.isToday && (
                <Badge className="text-xs bg-primary text-primary-foreground">Today</Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => { 
                setNewSlot({ 
                  day_of_week: selectedDayIndex, 
                  start_time: "09:00:00", 
                  end_time: "12:00:00", 
                  appointment_duration: 30 
                }); 
                setIsAddDialogOpen(true); 
              }}
            >
              <Plus className="size-3 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedDaySlots.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedDaySlots.map((slot) => (
                <div 
                  key={slot.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 group hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {formatTimeForDisplay(slot.start_time)} - {formatTimeForDisplay(slot.end_time)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getSlotDuration(slot)} · {slot.appointment_duration}m/patient
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Clock className="size-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted-foreground">No slots set</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
