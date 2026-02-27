"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Clock, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { addDays, format, isSameDay, startOfToday } from "date-fns"

const TIME_SLOTS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
]

const MORNING_SLOTS = TIME_SLOTS.filter((s) => s.includes("AM"))
const AFTERNOON_SLOTS = TIME_SLOTS.filter((s) => s.includes("PM"))

export function TimeSlots() {
  const today = startOfToday()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<Date>(today)
  const [selectedSlots, setSelectedSlots] = useState<
    Record<string, string[]>
  >(() => {
    const initial: Record<string, string[]> = {}
    const todayKey = format(today, "yyyy-MM-dd")
    initial[todayKey] = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "04:00 PM",
    ]
    const tomorrowKey = format(addDays(today, 1), "yyyy-MM-dd")
    initial[tomorrowKey] = [
      "08:00 AM",
      "08:30 AM",
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "11:30 AM",
      "01:00 PM",
      "02:00 PM",
    ]
    const day3Key = format(addDays(today, 2), "yyyy-MM-dd")
    initial[day3Key] = [
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
    ]
    return initial
  })

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      addDays(today, weekOffset * 7 + i)
    )
  }, [today, weekOffset])

  const selectedDayKey = format(selectedDay, "yyyy-MM-dd")
  const daySlots = selectedSlots[selectedDayKey] || []

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) => {
      const current = prev[selectedDayKey] || []
      const isSelected = current.includes(slot)
      return {
        ...prev,
        [selectedDayKey]: isSelected
          ? current.filter((s) => s !== slot)
          : [...current, slot],
      }
    })
  }

  const selectAllSlots = () => {
    setSelectedSlots((prev) => ({
      ...prev,
      [selectedDayKey]: [...TIME_SLOTS],
    }))
  }

  const clearAllSlots = () => {
    setSelectedSlots((prev) => ({
      ...prev,
      [selectedDayKey]: [],
    }))
  }

  const getTotalSlotsForDay = (date: Date) => {
    const key = format(date, "yyyy-MM-dd")
    return (selectedSlots[key] || []).length
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Time Slots</h3>
            <Clock className="size-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Select your available time slots for the next 7 days
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Time slots info">
              <Info className="size-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Click time slots to mark when you are available
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset((p) => Math.max(0, p - 1))}
          disabled={weekOffset === 0}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="text-sm font-medium text-foreground">
          {format(days[0], "MMM d")} - {format(days[6], "MMM d, yyyy")}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset((p) => p + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Day Selector */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 overflow-x-auto" role="listbox" aria-label="Select a day">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDay)
          const isToday = isSameDay(day, today)
          const slotsCount = getTotalSlotsForDay(day)
          return (
            <Button
              key={day.toISOString()}
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedDay(day)}
              className="group flex flex-col items-center gap-1 h-auto px-2 py-3"
              role="option"
              aria-selected={isSelected}
            >
              <span
                className={`text-[11px] font-medium uppercase transition-colors ${
                  isSelected
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-primary-foreground"
                }`}
              >
                {format(day, "EEE")}
              </span>
              <span
                className={`text-lg font-semibold transition-colors ${
                  isSelected
                    ? "text-primary-foreground"
                    : "text-foreground group-hover:text-primary-foreground"
                }`}
              >
                {format(day, "d")}
              </span>
              {isToday && (
                <div
                  className={`size-1.5 rounded-full ${
                    isSelected ? "bg-primary-foreground" : "bg-primary group-hover:bg-primary-foreground"
                  }`}
                />
              )}
              {!isToday && slotsCount > 0 && (
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isSelected
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-primary-foreground"
                  }`}
                >
                  {slotsCount} slots
                </span>
              )}
              {!isToday && slotsCount === 0 && (
                <span
                  className={`text-[10px] transition-colors ${
                    isSelected
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground/60 group-hover:text-primary-foreground/70"
                  }`}
                >
                  No slots
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Slots for selected day */}
      <Card className="py-4">
        <CardContent className="px-5 py-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {format(selectedDay, "EEEE, MMMM d")}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {daySlots.length} selected
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={selectAllSlots}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={clearAllSlots}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Morning */}
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
              Morning
            </Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {MORNING_SLOTS.map((slot) => {
                const isActive = daySlots.includes(slot)
                return (
                  <Toggle
                    key={slot}
                    variant="outline"
                    size="sm"
                    pressed={isActive}
                    onPressedChange={() => toggleSlot(slot)}
                    aria-label={`Toggle ${slot}`}
                    className={
                      isActive
                        ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        : ""
                    }
                  >
                    {slot}
                  </Toggle>
                )
              })}
            </div>
          </div>

          {/* Afternoon / Evening */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
              Afternoon / Evening
            </Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {AFTERNOON_SLOTS.map((slot) => {
                const isActive = daySlots.includes(slot)
                return (
                  <Toggle
                    key={slot}
                    variant="outline"
                    size="sm"
                    pressed={isActive}
                    onPressedChange={() => toggleSlot(slot)}
                    aria-label={`Toggle ${slot}`}
                    className={
                      isActive
                        ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        : ""
                    }
                  >
                    {slot}
                  </Toggle>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
