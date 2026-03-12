import { RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ServiceOption } from "@/types/doctor-profile";

interface ServiceSelectorProps {
  services: ServiceOption[];
  selectedService: ServiceOption | null;
  onSelect: (service: ServiceOption) => void;
}

export function ServiceSelector({
  services,
  selectedService,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <div>
      <SectionHeading step={1} label="Select Service" />
      <div className="grid gap-2 sm:grid-cols-2">
        {services
          .filter((s) => s.enabled)
          .map((service) => {
            const isActive = selectedService?.id === service.id;
            return (
              <ServiceCard
                key={service.id}
                service={service}
                isActive={isActive}
                onSelect={onSelect}
              />
            );
          })}
      </div>
    </div>
  );
}

// ── Internal components ────────────────────────────────────────────

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

function ServiceCard({
  service,
  isActive,
  onSelect,
}: {
  service: ServiceOption;
  isActive: boolean;
  onSelect: (s: ServiceOption) => void;
}) {
  return (
    <Card
      className={`py-3 cursor-pointer transition-all hover:shadow-sm ${
        isActive
          ? "border-primary ring-1 ring-primary/20 bg-primary/[0.03]"
          : "hover:border-primary/30"
      }`}
      onClick={() => onSelect(service)}
      role="radio"
      aria-checked={isActive}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(service);
      }}
    >
      <CardContent className="px-4 py-0">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {service.type === "followup" ? (
              <RotateCcw className="size-5" />
            ) : (
              service.icon
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {service.name}
              </p>
              {service.type === "followup" && (
                <Badge variant="secondary" className="text-[10px]">
                  Follow-up
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {service.price > 0 ? `₹${service.price}` : "As per previous"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}