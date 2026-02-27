// components/SuccessScreen.tsx
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SuccessScreenProps {
  firstName: string
  lastName: string
  onReset: () => void
}

export function SuccessScreen({ firstName, lastName, onReset }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Profile Submitted!
        </h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Dr. {firstName} {lastName}'s profile has been saved and is under review.
        </p>
        <Button
          onClick={onReset}
          className="mt-2"
        >
          Submit Another Profile
        </Button>
      </div>
    </div>
  )
}