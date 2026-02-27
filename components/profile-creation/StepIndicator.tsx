// components/StepIndicator.tsx
import {
  CheckCircle2,
  User,
  Stethoscope,
  Building2,
  Phone,
  Star,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  { id: 0, label: "Basic Info", icon: User },
  { id: 1, label: "Professional", icon: Stethoscope },
  { id: 2, label: "Clinic", icon: Building2 },
  { id: 3, label: "Contact", icon: Phone },
  { id: 4, label: "Additional", icon: Star },
  { id: 5, label: "Account", icon: KeyRound },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const progress = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div className="space-y-4 mb-8">
      {/* Step Icons */}
      <div className="flex items-center justify-between px-1">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isActive &&
                      "bg-primary border-primary text-primary-foreground shadow-sm",
                    isDone && "bg-primary/20 border-primary text-primary",
                    !isActive &&
                      !isDone &&
                      "bg-muted border-border text-muted-foreground",
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium hidden sm:block",
                    isActive
                      ? "text-primary"
                      : isDone
                        ? "text-primary/70"
                        : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-1 transition-all duration-500",
                    isDone ? "bg-primary/50" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
