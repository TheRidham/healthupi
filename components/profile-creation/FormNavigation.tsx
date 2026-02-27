// components/FormNavigation.tsx
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react"

interface FormNavigationProps {
  step: number
  totalSteps: number
  loading: boolean
  onPrev: () => void
  onNext: () => void
}

export function FormNavigation({ step, totalSteps, loading, onPrev, onNext }: FormNavigationProps) {
  const isLast = step === totalSteps - 1

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t">
      <Button
        type="button"
        variant="ghost"
        onClick={onPrev}
        disabled={step === 0}
        className="disabled:opacity-0 gap-1.5"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </Button>

      <span className="text-xs text-muted-foreground tabular-nums">
        {step + 1} / {totalSteps}
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