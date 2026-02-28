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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
} from "lucide-react"
import { addDays, format, startOfToday, isSameDay } from "date-fns"

interface TimeSlot {
  id: string
  day: string
  startTime: string
  endTime: string
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
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

function to24Hour(hour12: number, ampm: string): number {
  if (ampm === "AM") return hour12 === 12 ? 0 : hour12
  return hour12 === 12 ? 12 : hour12 + 12
}

export function TimeSlots() {
  const today = startOfToday()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[today.getDay() - 1] || "Mon")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [newSlot, setNewSlot] = useState({ day: "Mon", startTime: "09:00", endTime: "12:00" })
  const [pendingSlots, setPendingSlots] = useState<TimeSlot[]>([])
  const [overlapError, setOverlapError] = useState("")
  
  const [slots, setSlots] = useState<TimeSlot[]>([
    { id: "1", day: "Mon", startTime: "09:00", endTime: "12:00" },
    { id: "2", day: "Mon", startTime: "14:00", endTime: "17:00" },
    { id: "3", day: "Tue", startTime: "10:00", endTime: "13:00" },
    { id: "4", day: "Wed", startTime: "09:00", endTime: "11:00" },
    { id: "5", day: "Wed", startTime: "16:00", endTime: "19:00" },
    { id: "6", day: "Thu", startTime: "09:00", endTime: "12:00" },
    { id: "7", day: "Fri", startTime: "10:00", endTime: "14:00" },
    { id: "8", day: "Sat", startTime: "11:00", endTime: "15:00" },
  ])

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = addDays(today, weekOffset * 7 + i)
      return {
        abbrev: format(dayDate, "EEE") as "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun",
        full: format(dayDate, "EEEE"),
        fullDate: format(dayDate, "MMMM d, yyyy"),
        date: dayDate,
        dayNum: format(dayDate, "d"),
        month: format(dayDate, "MMM"),
        isToday: isSameDay(dayDate, today),
      }
    })
  }, [today, weekOffset])

  const getSlotsForDay = (dayAbbrev: string) => {
    return slots.filter((s) => s.day === dayAbbrev).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const formatTimeForDisplay = (time: string) => {
    const [h, m] = (time || "09:00").split(":").map(Number)
    const hour12 = h % 12 || 12
    const ampm = h >= 12 ? "PM" : "AM"
    return `${hour12}:${(m || 0).toString().padStart(2, "0")} ${ampm}`
  }

  const getSlotDuration = (slot: TimeSlot) => {
    const start = timeToMinutes(slot.startTime)
    const end = timeToMinutes(slot.endTime)
    const mins = end - start
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60)
      const remainMins = mins % 60
      return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`
    }
    return `${mins}m`
  }

  const getSlotDurationPreview = () => {
    const start = timeToMinutes(newSlot.startTime)
    const end = timeToMinutes(newSlot.endTime)
    if (isNaN(start) || isNaN(end) || end <= start) return "Invalid"
    const mins = end - start
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60)
      const remainMins = mins % 60
      return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`
    }
    return `${mins}m`
  }

  const getTotalHoursThisWeek = () => {
    const totalMins = slots.reduce((acc, slot) => {
      const start = timeToMinutes(slot.startTime)
      const end = timeToMinutes(slot.endTime)
      return acc + (end - start)
    }, 0)
    const hrs = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
  }

  const timeOptions = useMemo(() => {
    const opts = []
    for (let h = 6; h <= 21; h++) {
      for (let m = 0; m < 60; m += 15) {
        const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
        opts.push(time)
      }
    }
    return opts
  }, [])

  const checkOverlap = (day: string, start: string, end: string, excludeId?: string): boolean => {
    const newStart = timeToMinutes(start)
    const newEnd = timeToMinutes(end)
    if (isNaN(newStart) || isNaN(newEnd)) return false
    
    return slots.some(slot => {
      if (slot.day !== day) return false
      if (excludeId && slot.id === excludeId) return false
      
      const slotStart = timeToMinutes(slot.startTime)
      const slotEnd = timeToMinutes(slot.endTime)
      
      return (newStart < slotEnd && newEnd > slotStart)
    })
  }

  const deleteSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }

  const handleStartTimeChange = (value: string) => {
    const parsed = parseTimeInput(value)
    setNewSlot(prev => ({ ...prev, startTime: parsed }))
  }

  const handleEndTimeChange = (value: string) => {
    const parsed = parseTimeInput(value)
    setNewSlot(prev => ({ ...prev, endTime: parsed }))
  }

  const addSlot = () => {
    setOverlapError("")
    
    const startMins = timeToMinutes(newSlot.startTime)
    const endMins = timeToMinutes(newSlot.endTime)
    
    if (isNaN(startMins) || isNaN(endMins)) {
      setOverlapError("Please enter valid times")
      return
    }
    
    if (endMins <= startMins) {
      setOverlapError("End time must be after start time")
      return
    }

    const allSlots = [...slots, ...pendingSlots]
    const hasOverlap = allSlots.some(slot => {
      if (slot.day !== newSlot.day) return false
      const slotStart = timeToMinutes(slot.startTime)
      const slotEnd = timeToMinutes(slot.endTime)
      return (startMins < slotEnd && endMins > slotStart)
    })
    
    if (hasOverlap) {
      setOverlapError("This time slot overlaps with an existing slot")
      return
    }

    const formattedStart = minutesToTime(startMins)
    const formattedEnd = minutesToTime(endMins)

    const newSlotWithId: TimeSlot = {
      id: Date.now().toString(),
      day: newSlot.day,
      startTime: formattedStart,
      endTime: formattedEnd,
    }
    setPendingSlots((prev) => [...prev, newSlotWithId])
    setNewSlot({ day: selectedDay, startTime: "09:00", endTime: "12:00" })
  }

  const saveAllSlots = () => {
    setSlots((prev) => [...prev, ...pendingSlots])
    setPendingSlots([])
    setIsAddDialogOpen(false)
    setNewSlot({ day: selectedDay, startTime: "09:00", endTime: "12:00" })
  }

  const cancelAdd = () => {
    setPendingSlots([])
    setOverlapError("")
    setIsAddDialogOpen(false)
  }

  const removePendingSlot = (id: string) => {
    setPendingSlots((prev) => prev.filter((s) => s.id !== id))
  }

  const applyTemplate = (template: string) => {
    let newSlots: TimeSlot[] = []
    const id = Date.now().toString()
    
    switch (template) {
      case "weekdays":
        DAYS.slice(0, 5).forEach((day, i) => {
          newSlots.push({ id: `${id}-${i}`, day, startTime: "09:00", endTime: "17:00" })
        })
        break
      case "mon-wed-fri":
        ["Mon", "Wed", "Fri"].forEach((day, i) => {
          newSlots.push({ id: `${id}-${i}`, day, startTime: "09:00", endTime: "14:00" })
        })
        break
      case "morning-only":
        DAYS.forEach((day, i) => {
          newSlots.push({ id: `${id}-${i}`, day, startTime: "08:00", endTime: "12:00" })
        })
        break
      case "evening-only":
        DAYS.forEach((day, i) => {
          newSlots.push({ id: `${id}-${i}`, day, startTime: "16:00", endTime: "20:00" })
        })
        break
      case "sat-only":
        newSlots.push({ id: `${id}-0`, day: "Sat", startTime: "10:00", endTime: "16:00" })
        break
    }
    
    setSlots((prev) => [...prev, ...newSlots])
    setIsTemplateDialogOpen(false)
  }

  const selectedDayData = days.find(d => d.abbrev === selectedDay) || days[0]
  const selectedDaySlots = getSlotsForDay(selectedDay)

  const handleDayClick = (dayAbbrev: string) => {
    setSelectedDay(dayAbbrev)
    const daySlots = getSlotsForDay(dayAbbrev)
    if (daySlots.length === 0) {
      setNewSlot({ day: dayAbbrev, startTime: "09:00", endTime: "12:00" })
      setIsAddDialogOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addSlot()
    }
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
            {getTotalHoursThisWeek()} total this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <Wand2 className="size-4 mr-1" />
            Templates
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-1" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
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
                        key={day.abbrev}
                        onClick={() => setNewSlot({ ...newSlot, day: day.abbrev })}
                        className={`p-2 rounded-lg text-center transition-all ${
                          newSlot.day === day.abbrev
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        <div className="text-[10px] opacity-70">{day.abbrev}</div>
                        <div className="text-sm font-bold">{day.dayNum}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Inputs - 12 Hour Style with Arrows */}
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Time Slot</Label>
                  <div className="flex items-center justify-center gap-3 bg-muted/30 rounded-xl p-4">
                    {/* Start Time */}
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] text-muted-foreground mb-1">Start</div>
                      {(() => {
                        const t = formatTime12hInput(newSlot.startTime)
                        return (
                          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                            {/* Hours */}
                            <div className="flex flex-col items-center">
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const current = parseInt(t.hour) || 9
                                const next = current >= 12 ? 1 : current + 1
                                const h24 = to24Hour(next, t.ampm)
                                setNewSlot(prev => ({ ...prev, startTime: `${h24.toString().padStart(2,"0")}:${prev.startTime.split(":")[1] || "00"}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <Input value={t.hour} onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, "").slice(-2)
                                if (v !== "") {
                                  const num = parseInt(v)
                                  if (num >= 1 && num <= 12) {
                                    const h24 = to24Hour(num, t.ampm)
                                    setNewSlot(prev => ({ ...prev, startTime: `${h24.toString().padStart(2,"0")}:${prev.startTime.split(":")[1] || "00"}` }))
                                  }
                                }
                              }} className="w-8 h-8 text-center font-mono text-sm font-bold p-1" />
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const current = parseInt(t.hour) || 9
                                const next = current <= 1 ? 12 : current - 1
                                const h24 = to24Hour(next, t.ampm)
                                setNewSlot(prev => ({ ...prev, startTime: `${h24.toString().padStart(2,"0")}:${prev.startTime.split(":")[1] || "00"}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                            <span className="font-bold text-sm">:</span>
                            {/* Minutes */}
                            <div className="flex flex-col items-center">
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const [h, m] = (newSlot.startTime || "09:00").split(":").map(Number)
                                const next = m >= 45 ? 0 : m + 15
                                setNewSlot(prev => ({ ...prev, startTime: `${prev.startTime.split(":")[0].padStart(2,"0")}:${next.toString().padStart(2,"0")}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <Input value={t.min} onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, "").slice(-2)
                                if (v !== "") {
                                  const num = parseInt(v)
                                  if (num <= 59) {
                                    setNewSlot(prev => ({ ...prev, startTime: `${prev.startTime.split(":")[0].padStart(2,"0")}:${v.padStart(2,"0")}` }))
                                  }
                                }
                              }} className="w-8 h-8 text-center font-mono text-sm font-bold p-1" />
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const [h, m] = (newSlot.startTime || "09:00").split(":").map(Number)
                                const next = m <= 0 ? 45 : m - 15
                                setNewSlot(prev => ({ ...prev, startTime: `${prev.startTime.split(":")[0].padStart(2,"0")}:${next.toString().padStart(2,"0")}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                            {/* AM/PM */}
                            <div className="flex flex-col items-center ml-1">
                              <button type="button" className="p-0.5 hover:bg-muted rounded text-xs font-bold" onClick={() => {
                                const newAmpm = t.ampm === "AM" ? "PM" : "AM"
                                const h24 = to24Hour(parseInt(t.hour) || 9, newAmpm)
                                setNewSlot(prev => ({ ...prev, startTime: `${h24.toString().padStart(2,"0")}:${prev.startTime.split(":")[1] || "00"}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <div className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-muted rounded">{t.ampm}</div>
                              <button type="button" className="p-0.5 hover:bg-muted rounded text-xs font-bold" onClick={() => {
                                const newAmpm = t.ampm === "AM" ? "PM" : "AM"
                                const h24 = to24Hour(parseInt(t.hour) || 9, newAmpm)
                                setNewSlot(prev => ({ ...prev, startTime: `${h24.toString().padStart(2,"0")}:${prev.startTime.split(":")[1] || "00"}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                    
                    <div className="text-2xl text-muted-foreground font-bold self-end mb-4">→</div>
                    
                    {/* End Time */}
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] text-muted-foreground mb-1">End</div>
                      {(() => {
                        const t = formatTime12hInput(newSlot.endTime)
                        return (
                          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                            {/* Hours */}
                            <div className="flex flex-col items-center">
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const current = parseInt(t.hour) || 12
                                const next = current >= 12 ? 1 : current + 1
                                const h24 = to24Hour(next, t.ampm)
                                setNewSlot(prev => ({ ...prev, endTime: `${h24.toString().padStart(2,"0")}:${prev.endTime.split(":")[1] || "00"}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <Input value={t.hour} onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, "").slice(-2)
                                if (v !== "") {
                                  const num = parseInt(v)
                                  if (num >= 1 && num <= 12) {
                                    const h24 = to24Hour(num, t.ampm)
                                    setNewSlot(prev => ({ ...prev, endTime: `${h24.toString().padStart(2,"0")}:${prev.endTime.split(":")[1] || "00"}` }))
                                  }
                                }
                              }} className="w-8 h-8 text-center font-mono text-sm font-bold p-1" />
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const current = parseInt(t.hour) || 12
                                const next = current <= 1 ? 12 : current - 1
                                const h24 = to24Hour(next, t.ampm)
                                setNewSlot(prev => ({ ...prev, endTime: `${h24.toString().padStart(2,"0")}:${prev.endTime.split(":")[1] || "00"}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                            <span className="font-bold text-sm">:</span>
                            {/* Minutes */}
                            <div className="flex flex-col items-center">
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const [h, m] = (newSlot.endTime || "12:00").split(":").map(Number)
                                const next = m >= 45 ? 0 : m + 15
                                setNewSlot(prev => ({ ...prev, endTime: `${prev.endTime.split(":")[0].padStart(2,"0")}:${next.toString().padStart(2,"0")}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <Input value={t.min} onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, "").slice(-2)
                                if (v !== "") {
                                  const num = parseInt(v)
                                  if (num <= 59) {
                                    setNewSlot(prev => ({ ...prev, endTime: `${prev.endTime.split(":")[0].padStart(2,"0")}:${v.padStart(2,"0")}` }))
                                  }
                                }
                              }} className="w-8 h-8 text-center font-mono text-sm font-bold p-1" />
                              <button type="button" className="p-0.5 hover:bg-muted rounded" onClick={() => {
                                const [h, m] = (newSlot.endTime || "12:00").split(":").map(Number)
                                const next = m <= 0 ? 45 : m - 15
                                setNewSlot(prev => ({ ...prev, endTime: `${prev.endTime.split(":")[0].padStart(2,"0")}:${next.toString().padStart(2,"0")}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                            {/* AM/PM */}
                            <div className="flex flex-col items-center ml-1">
                              <button type="button" className="p-0.5 hover:bg-muted rounded text-xs font-bold" onClick={() => {
                                const newAmpm = t.ampm === "AM" ? "PM" : "AM"
                                const h24 = to24Hour(parseInt(t.hour) || 12, newAmpm)
                                setNewSlot(prev => ({ ...prev, endTime: `${h24.toString().padStart(2,"0")}:${prev.endTime.split(":")[1] || "00"}` }))
                              }}><ChevronUp className="size-3" /></button>
                              <div className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-muted rounded">{t.ampm}</div>
                              <button type="button" className="p-0.5 hover:bg-muted rounded text-xs font-bold" onClick={() => {
                                const newAmpm = t.ampm === "AM" ? "PM" : "AM"
                                const h24 = to24Hour(parseInt(t.hour) || 12, newAmpm)
                                setNewSlot(prev => ({ ...prev, endTime: `${h24.toString().padStart(2,"0")}:${prev.endTime.split(":")[1] || "00"}` }))
                              }}><ChevronDown className="size-3" /></button>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  
                  {/* Duration Preview */}
                  <div className="flex justify-center">
                    <Badge variant="outline" className="text-sm px-4 py-1 bg-muted/30">
                      Duration: {getSlotDurationPreview()}
                    </Badge>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quick Presets</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Morning", start: "09:00", end: "12:00" },
                      { label: "Afternoon", start: "14:00", end: "17:00" },
                      { label: "Evening", start: "18:00", end: "20:00" },
                      { label: "Lunch", start: "10:00", end: "13:00" },
                      { label: "Full Day", start: "09:00", end: "17:00" },
                      { label: "Short Day", start: "10:00", end: "16:00" },
                    ].map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        className="text-xs h-9"
                        onClick={() => setNewSlot({ ...newSlot, startTime: preset.start, endTime: preset.end })}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {overlapError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="size-4 shrink-0" />
                    {overlapError}
                  </div>
                )}

                {/* Pending Slots List */}
                {pendingSlots.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Slots to Add ({pendingSlots.length})
                    </Label>
                    <div className="max-h-32 overflow-y-auto space-y-1 bg-muted/30 rounded-lg p-2">
                      {pendingSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-2 bg-background rounded text-sm">
                          <span className="font-medium">{slot.day}</span>
                          <span className="text-muted-foreground">
                            {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removePendingSlot(slot.id)}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={cancelAdd} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button id="add-more-btn" onClick={addSlot} variant="outline" className="flex-1 sm:flex-none">
                    <Plus className="size-4 mr-1" />
                    Add More
                  </Button>
                  {pendingSlots.length > 0 && (
                    <Button onClick={saveAllSlots} className="flex-1 sm:flex-none">
                      Save All ({pendingSlots.length})
                    </Button>
                  )}
                </div>
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
              { label: "Mon - Fri Full Day", sub: "9 AM - 5 PM", start: "09:00", end: "17:00", days: DAYS.slice(0, 5) },
              { label: "Mon, Wed, Fri", sub: "9 AM - 2 PM", start: "09:00", end: "14:00", days: ["Mon", "Wed", "Fri"] },
              { label: "Morning Only (Daily)", sub: "8 AM - 12 PM", start: "08:00", end: "12:00", days: DAYS },
              { label: "Evening Only (Daily)", sub: "4 PM - 8 PM", start: "16:00", end: "20:00", days: DAYS },
              { label: "Saturday Only", sub: "10 AM - 4 PM", start: "10:00", end: "16:00", days: ["Sat"] },
            ].map((template) => (
              <Button
                key={template.label}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => applyTemplate(template.label.split(" ")[0].toLowerCase() + "-" + template.label.split(" ")[1]?.toLowerCase() || "custom")}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset((p) => Math.max(0, p - 1))}
          disabled={weekOffset === 0}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {days[0].month} {days[0].dayNum} - {days[6].month} {days[6].dayNum}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset((p) => p + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySlots = getSlotsForDay(day.abbrev)
          const hasSlots = daySlots.length > 0
          const isSelected = selectedDay === day.abbrev
          
          const formatTimeShort = (time: string) => {
            const [h, m] = time.split(":")
            const hour = parseInt(h)
            const ampm = hour >= 12 ? "pm" : "am"
            const h12 = hour % 12 || 12
            return m === "00" ? `${h12}${ampm}` : `${h12}:${m}${ampm}`
          }
          
          return (
            <Card 
              key={day.abbrev}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30" 
                  : day.isToday 
                    ? "border-primary/50 bg-primary/5" 
                    : hasSlots 
                      ? "border-muted-foreground/20 hover:border-primary/40" 
                      : "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
              }`}
              onClick={() => handleDayClick(day.abbrev)}
            >
              <CardContent className="p-2 text-center">
                <div className={`text-xs font-semibold uppercase tracking-wide ${day.isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {day.abbrev}
                </div>
                <div className={`text-2xl font-bold my-1 ${day.isToday || isSelected ? "text-primary" : ""}`}>
                  {day.dayNum}
                </div>
                {hasSlots ? (
                  <div className="flex flex-col gap-0.5">
                    {daySlots.slice(0, 2).map((slot) => (
                      <div 
                        key={slot.id}
                        className="text-[9px] bg-primary/80 text-primary-foreground rounded px-1 py-0.5 truncate"
                      >
                        {formatTimeShort(slot.startTime)}-{formatTimeShort(slot.endTime)}
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
      <Card className="animate-in slide-in-from-top-2 fade-in duration-200 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              {selectedDayData.full}
              <Badge variant="outline" className="text-xs">
                {selectedDaySlots.length} slots
              </Badge>
              {selectedDayData.isToday && (
                <Badge className="text-xs bg-primary text-primary-foreground">Today</Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 text-xs"
              onClick={() => { 
                setNewSlot({ day: selectedDay, startTime: "09:00", endTime: "12:00" }); 
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
                        {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getSlotDuration(slot)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); deleteSlot(slot.id); }}
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
