import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, LoaderCircle, Clock } from "lucide-react";
import { getServiceIcon } from "./services.utils";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  fee?: number;
  iconType: string;
  selected: boolean;
}

interface ServicesSectionProps {
  services: Service[];
  selectedServices: Service[];
  onToggleService: (serviceId: string) => void;
  onProceed: () => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function ServicesSection({
  services,
  selectedServices,
  onToggleService,
  onProceed,
  isLoading,
  onCancel,
}: ServicesSectionProps) {
  return (
    <Card className="mb-8 p-6 sm:p-8 border-primary/30 bg-card">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Ready to book?
        </h2>
        <p className="text-foreground/70">
          Select a service and schedule your appointment
        </p>
      </div>

      {/* Services Grid */}
      <div className="mb-8 grid sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onToggleService(service.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition ${
              service.selected
                ? "border-primary bg-primary/10"
                : "border-secondary/30 bg-secondary/5 hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                  selectedServices.find((s) => s.id === service.id)
                    ? "border-primary bg-primary"
                    : "border-secondary/50"
                }`}
              >
                {selectedServices.find((s) => s.id === service.id) && (
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                  {React.createElement(getServiceIcon(service.iconType), {
                    className: `w-5 h-5 ${
                      service.selected ? "text-primary" : "text-foreground/60"
                    }`,
                  })}
                  <h4 className="font-semibold text-foreground">
                    {service.name}
                  </h4>
                </div>
                <p className="text-sm text-foreground/60 mb-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-foreground/50">
                    <Clock className="w-3 h-3" />
                    {service.duration} mins
                  </div>
                  {service.fee && (
                    <span className="text-sm font-semibold text-primary">
                      ₹{service.fee}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onProceed}
          disabled={selectedServices.length === 0 || isLoading}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              Book Appointment
              {selectedServices.length > 0 && (
                <>
                  <span className="mx-2">•</span>
                  <Badge className="bg-primary-foreground text-primary">
                    {selectedServices.length}
                  </Badge>
                </>
              )}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-6 py-5.5"
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
}
