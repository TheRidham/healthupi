import { forwardRef } from "react";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ServiceOption, SimpleSlot } from "@/types/doctor-profile";

interface BookingSummaryBarProps {
  service: ServiceOption;
  date: Date;
  slot: SimpleSlot;
  onContinue: () => void;
}

export const BookingSummaryBar = forwardRef<HTMLDivElement | null, BookingSummaryBarProps>(
  function BookingSummaryBar({ service, date, slot, onContinue }, ref) {
    return (
      <Card
        ref={ref}
        className="py-4 border-primary/20 bg-primary/[0.02]"
      >
        <CardContent className="px-5 py-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground flex-wrap">
              <span>{service.name}</span>
              <Separator orientation="vertical" className="h-3.5" />
              <span>{format(date, "MMM d")}</span>
              <Separator orientation="vertical" className="h-3.5" />
              <span>
                {slot.time} – {slot.endTime}
              </span>
              <Badge variant="secondary" className="text-[10px] h-5">
                {slot.duration}m
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total:{" "}
              <span className="font-semibold text-primary">₹{service.price}</span>
            </p>
          </div>
          <Button onClick={onContinue} className="gap-1.5 shrink-0">
            Continue
            <ArrowRight className="size-3.5" />
          </Button>
        </CardContent>
      </Card>
    );
  },
);