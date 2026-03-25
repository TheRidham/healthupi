"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, AlertCircle, LoaderCircle } from "lucide-react";
import { addDays, format, startOfToday, getDay } from "date-fns";
import { AvailableSlot, SelectedSlot } from "@/types/booking";

interface TimeSlotSelectorProps {
  doctorId: string;
  selectedServices: Array<{ id: string; name: string; fee?: number }>;
  onSlotSelected: (slot: SelectedSlot) => void;
  onBack: () => void;
  onCancel: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

export default function TimeSlotSelector({
  doctorId,
  selectedServices,
  onSlotSelected,
  onBack,
  onCancel,
}: TimeSlotSelectorProps) {
  const today = startOfToday();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(today, "yyyy-MM-dd"));
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Fetch time slots from API
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/appointments/available-slots?doctorId=${doctorId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch available slots");
        }

        const data = await response.json();
        if (data.success) {
          setTimeSlots(data.data || []);
        } else {
          setError(data.error || "Failed to load time slots");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading slots");
        console.error("Error fetching time slots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [doctorId]);

  // Get 7-day date range
  const dateRange = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  // Get available dates from slots
  const availableDatesMap = new Map<string, number>();
  timeSlots.forEach((slot) => {
    const count = availableDatesMap.get(slot.date) || 0;
    availableDatesMap.set(slot.date, count + 1);
  });

  // Get slots for selected date
  const slotsForDate = timeSlots.filter((slot) => slot.date === selectedDate);

  // Group by period
  const slotsByPeriod = {
    morning: slotsForDate.filter((s) => s.period === "morning"),
    afternoon: slotsForDate.filter((s) => s.period === "afternoon"),
    evening: slotsForDate.filter((s) => s.period === "evening"),
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      setError("Please select a time slot");
      return;
    }

    const selectedSlotData: SelectedSlot = {
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      duration: selectedSlot.duration,
      dayOfWeek: getDay(new Date(selectedSlot.date)),
    };

    onSlotSelected(selectedSlotData);
  };

  if (loading) {
    return (
      <Card className="p-8 mb-8">
        <div className="flex items-center justify-center gap-3">
          <LoaderCircle className="w-5 h-5 animate-spin text-primary" />
          <p className="text-foreground/60">Loading available time slots...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 mb-8 border-destructive/50 bg-destructive/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground mb-2">{error}</p>
            <Button onClick={onBack} variant="outline" size="sm">
              Go Back
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Card className="p-8 mb-8">
        <div className="text-center">
          <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground/60 mb-4">No available slots for the next 7 days</p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  const selectedDateObj = new Date(selectedDate);
  const dateRangeFormatted = `${format(dateRange[0], "MMM d")} - ${format(
    dateRange[6],
    "MMM d, yyyy"
  )}`;

  return (
    <Card className="p-6 sm:p-8 mb-8 border-primary/30 bg-card">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Pick Date & Time</h2>
        <p className="text-foreground/70">Select an available time slot for your appointment</p>
      </div>

      {/* Date Range Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          className="p-1 hover:bg-primary/10 rounded"
          onClick={() => {/* handle prev week */}}
          >
          <ChevronLeft className="w-5 h-5 text-foreground/60" />
        </button>
        <span className="text-sm font-semibold text-foreground">{dateRangeFormatted}</span>
        <button className="p-1 hover:bg-primary/10 rounded">
          <ChevronRight 
            onClick={() => {/* handle next week */}}
            className="w-5 h-5 text-foreground/60" 
          />
        </button>
      </div>

      {/* Date Cards */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {dateRange.map((date, idx) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dayName = DAYS[getDay(date)];
          const slotCount = availableDatesMap.get(dateStr) || 0;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`p-3 rounded-lg border-2 transition font-semibold text-center ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-secondary/30 bg-secondary/5 text-foreground hover:border-primary/50"
              }`}
            >
              <div className="text-xs tracking-wider mb-1">{dayName}</div>
              <div className="text-lg">{format(date, "d")}</div>
              <div className="text-xs text-foreground/60">{slotCount}</div>
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {slotsForDate.length > 0 ? (
        <div className="mb-8">
          <p className="text-sm font-semibold text-foreground/70 mb-4">
            {format(selectedDateObj, "EEEE, MMMM d")} • {slotsForDate.length} slots available
          </p>

          {/* Morning Slots */}
          {slotsByPeriod.morning.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                Morning
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slotsByPeriod.morning.map((slot, idx) => (
                  <button
                    key={`${slot.date}-${slot.startTime}-${idx}`}
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                      selectedSlot?.startTime === slot.startTime &&
                      selectedSlot?.date === slot.date
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-secondary/30 bg-secondary/5 text-foreground hover:border-primary/50"
                    }`}
                  >
                    {slot.formattedStart}
                    <div className="text-xs opacity-70">({slot.duration}m)</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Afternoon Slots */}
          {slotsByPeriod.afternoon.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                Afternoon / Evening
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slotsByPeriod.afternoon.map((slot, idx) => (
                  <button
                    key={`${slot.date}-${slot.startTime}-${idx}`}
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                      selectedSlot?.startTime === slot.startTime &&
                      selectedSlot?.date === slot.date
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-secondary/30 bg-secondary/5 text-foreground hover:border-primary/50"
                    }`}
                  >
                    {slot.formattedStart}
                    <div className="text-xs opacity-70">({slot.duration}m)</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Evening Slots */}
          {slotsByPeriod.evening.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                Evening
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slotsByPeriod.evening.map((slot, idx) => (
                  <button
                    key={`${slot.date}-${slot.startTime}-${idx}`}
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                      selectedSlot?.startTime === slot.startTime &&
                      selectedSlot?.date === slot.date
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-secondary/30 bg-secondary/5 text-foreground hover:border-primary/50"
                    }`}
                  >
                    {slot.formattedStart}
                    <div className="text-xs opacity-70">({slot.duration}m)</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 mb-8">
          <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground/60">No slots available for this date</p>
        </div>
      )}

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-8">
          <div className="flex items-start gap-3">
            <Badge className="bg-primary text-primary-foreground shrink-0">
              {selectedServices[0]?.name || "Service"}
            </Badge>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-foreground">
                {format(selectedDateObj, "MMM d, yyyy")} • {selectedSlot.formattedStart} -{" "}
                {selectedSlot.formattedEnd}
              </p>
              <p className="text-foreground/60">{selectedSlot.duration} mins</p>
            </div>
            {selectedServices[0]?.fee && (
              <p className="font-semibold text-primary text-lg">₹{selectedServices[0].fee}</p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onCancel} variant="outline" className="flex-1 py-6">
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedSlot}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
        >
          Continue →
        </Button>
      </div>
    </Card>
  );
}
