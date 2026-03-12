import { forwardRef } from "react";
import { format, isSameDay, startOfToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import type { SimpleSlot, ApiTimeSlot, Appointment } from "@/types/doctor-profile";
import { getSlotsForDate, getSlotCountForDate } from "@/lib/slots";

interface DateTimeSelectorProps {
  days: Date[];
  selectedDay: Date;
  selectedSlot: SimpleSlot | null;
  weekOffset: number;
  timeSlots: ApiTimeSlot[];
  appointments: Appointment[];
  onDayChange: (day: Date) => void;
  onSlotChange: (slot: SimpleSlot) => void;
  onWeekPrev: () => void;
  onWeekNext: () => void;
}

export const DateTimeSelector = forwardRef<HTMLDivElement | null, DateTimeSelectorProps>(
  function DateTimeSelector(
    {
      days,
      selectedDay,
      selectedSlot,
      weekOffset,
      timeSlots,
      appointments,
      onDayChange,
      onSlotChange,
      onWeekPrev,
      onWeekNext,
    },
    ref,
  ) {
    const today = startOfToday();

    // Split into morning / afternoon for display
    const { morningSlots, afternoonSlots, allSlots } = useSplitSlots(
      selectedDay,
      timeSlots,
      appointments,
    );

    return (
      <div ref={ref}>
        <SectionHeading step={2} label="Pick Date & Time" />

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onWeekPrev}
            disabled={weekOffset === 0}
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs font-medium text-foreground">
            {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onWeekNext}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Day picker */}
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDay);
            const isToday = isSameDay(day, today);
            const slotCount = getSlotCountForDate(day, timeSlots, appointments);

            return (
              <Button
                key={day.toISOString()}
                variant={isSelected ? "default" : "outline"}
                onClick={() => {
                  onDayChange(day);
                }}
                disabled={slotCount === 0}
                className={`group flex flex-col items-center gap-0.5 h-auto px-1.5 py-2.5 ${
                  slotCount === 0 ? "opacity-50" : ""
                }`}
              >
                <span
                  className={`text-[10px] font-medium uppercase transition-colors ${
                    isSelected
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-primary-foreground"
                  }`}
                >
                  {format(day, "EEE")}
                </span>
                <span
                  className={`text-base font-semibold transition-colors ${
                    isSelected
                      ? "text-primary-foreground"
                      : "text-foreground group-hover:text-primary-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {isToday && (
                  <div
                    className={`size-1 rounded-full ${
                      isSelected
                        ? "bg-primary-foreground"
                        : "bg-primary group-hover:bg-primary-foreground"
                    }`}
                  />
                )}
                {!isToday && slotCount > 0 && (
                  <span
                    className={`text-[9px] transition-colors ${
                      isSelected
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground group-hover:text-primary-foreground/80"
                    }`}
                  >
                    {slotCount}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Time slots */}
        {allSlots.length > 0 ? (
          <Card className="py-4">
            <CardContent className="px-4 py-0">
              <p className="text-xs font-medium text-foreground mb-3">
                {format(selectedDay, "EEEE, MMMM d")} – {allSlots.length} slots available
              </p>

              {morningSlots.length > 0 && (
                <SlotGroup
                  label="Morning"
                  slots={morningSlots}
                  selectedSlot={selectedSlot}
                  onSelect={onSlotChange}
                />
              )}
              {afternoonSlots.length > 0 && (
                <SlotGroup
                  label="Afternoon / Evening"
                  slots={afternoonSlots}
                  selectedSlot={selectedSlot}
                  onSelect={onSlotChange}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="py-8">
            <CardContent className="px-5 py-0 text-center">
              <p className="text-sm text-muted-foreground">No available slots on this day</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  },
);

// ── Internal helpers ──────────────────────────────────────────────

function SectionHeading({ step, label }: { step: number; label: string }) {
  return (
    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
        {step}
      </span>
      {label}
    </h3>
  );
}

function SlotGroup({
  label,
  slots,
  selectedSlot,
  onSelect,
}: {
  label: string;
  slots: SimpleSlot[];
  selectedSlot: SimpleSlot | null;
  onSelect: (slot: SimpleSlot) => void;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {slots.map((slot) => {
          const isActive = selectedSlot?.time === slot.time;
          return (
            <Toggle
              key={slot.time}
              variant="outline"
              size="sm"
              pressed={isActive}
              onPressedChange={() => onSelect(slot)}
              disabled={!slot.available}
              className={`text-xs h-8 px-3 ${
                !slot.available
                  ? "opacity-40 cursor-not-allowed line-through"
                  : isActive
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    : ""
              }`}
            >
              {slot.time}
              <span className="ml-1 text-[10px] opacity-70">({slot.duration}m)</span>
            </Toggle>
          );
        })}
      </div>
    </div>
  );
}

/** Splits the slot list for the selected day into morning / afternoon. */
function useSplitSlots(
  day: Date,
  timeSlots: ApiTimeSlot[],
  appointments: Appointment[],
) {
  const allSlots: SimpleSlot[] = getSlotsForDate(day, timeSlots, appointments);
  return {
    allSlots,
    morningSlots: allSlots.filter((s) => s.time.includes("AM")),
    afternoonSlots: allSlots.filter((s) => s.time.includes("PM")),
  };
}