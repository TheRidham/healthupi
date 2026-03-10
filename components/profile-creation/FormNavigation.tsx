// components/FormNavigation.tsx
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react"

interface FormNavigationProps {
  step: string
  totalSteps: number
  loading: boolean
  onPrev: () => void
  onNext: () => void
  hideNext?: boolean
  isFirstStep?: boolean
}

export function FormNavigation({ step, totalSteps, loading, onPrev, onNext, hideNext, isFirstStep }: FormNavigationProps) {
  const isLast = step === "account"

  console.log("last step: ", isLast);

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t">
      <Button
        type="button"
        variant="ghost"
        onClick={onPrev}
        disabled={isFirstStep}
        className="disabled:opacity-0 gap-1.5"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </Button>

      <span className="text-xs text-muted-foreground tabular-nums">
        Step {step}
      </span>

      {isLast ? (
        <Button
          type="submit"
          disabled={loading}
          className="gap-2"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            : <><CheckCircle2 className="w-4 h-4" /> Submit Profile</>
          }
        </Button>
      ) : hideNext ? (
        <div className="w-20" />
      ) : (
        <Button
          type="button"
          onClick={onNext}
          className="gap-1.5"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}