import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ label, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}

// ── Shared input className ────────────────────────────────────
export const inputCls =
  "bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"

export const selectTriggerCls =
  "bg-background border-input text-foreground focus:border-primary focus:ring-primary/20"