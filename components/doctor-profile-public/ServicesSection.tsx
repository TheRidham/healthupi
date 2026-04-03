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
    <Card className="mb-6 p-5 sm:p-6 border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">
          Select a Service
        </h2>
        <p className="text-xs text-muted-foreground">
          Choose the service you need and we'll find the perfect time for your appointment
        </p>
      </div>

      {/* Services Grid */}
      <div className="mb-6 grid sm:grid-cols-2 gap-3">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onToggleService(service.id)}
            className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              service.selected
                ? "border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all font-semibold text-xs ${
                  selectedServices.find((s) => s.id === service.id)
                    ? "border-primary bg-gradient-to-br from-primary to-blue-600 text-primary-foreground"
                    : "border-muted-foreground/40 bg-transparent"
                }`}
              >
                {selectedServices.find((s) => s.id === service.id) && (
                  <span>✓</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {React.createElement(getServiceIcon(service.iconType), {
                    className: `w-4 h-4 ${
                      service.selected ? "text-primary" : "text-muted-foreground"
                    }`,
                  })}
                  <h4 className="font-semibold text-foreground text-sm">
                    {service.name}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{service.duration} mins</span>
                  </div>
                  {service.fee && (
                    <span className="text-xs font-bold text-primary">
                      ₹{service.fee.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onProceed}
          disabled={selectedServices.length === 0 || isLoading}
          className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 text-primary-foreground font-semibold py-5 text-sm shadow-md disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin mr-1.5" />
              Processing...
            </>
          ) : (
            <>
              Continue to Booking
              {selectedServices.length > 0 && (
                <>
                  <span className="mx-1.5">•</span>
                  <Badge className="bg-primary-foreground text-primary font-semibold text-[10px]">
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
          className="px-5 py-5 border-border hover:bg-secondary/50 text-sm"
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
}
