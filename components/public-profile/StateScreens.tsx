import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="size-8 animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading doctor profile...</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="p-6 text-center">
          <AlertCircle className="size-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground mb-4">{message}</p>
          <Button onClick={() => (window.location.href = "/")}>Back to Home</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function VerifyingPaymentState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-12">
      <Loader2 className="size-8 text-primary animate-spin" />
      <div className="text-center text-sm">
        <p className="font-semibold text-foreground">Verifying Payment</p>
        <p className="text-xs text-muted-foreground mt-1">
          Validating your payment with the bank...
        </p>
      </div>
    </div>
  );
}