// components/steps/Step5Additional.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DoctorFormData } from "@/lib/type";
import { usePayment } from "@/hooks/useRazorpay";
import { Loader2, ArrowRight } from "lucide-react";

interface Props {
  form: DoctorFormData;
  set: (key: keyof DoctorFormData, value: any) => void;
  onNext?: () => void;
}

export function Step5Additional({ form, set, onNext }: Props) {
  const {
    initiatePayment,
    loading: paymentLoading,
    error: paymentError,
    reset, // Get reset function
  } = usePayment();
  
  // Reset when component mounts
  useEffect(() => {
    setError("");
    setSuccess(false);
    reset();
  }, [reset]);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const ACCOUNT_CREATION_FEE = 1000; // ₹1000

  async function handlePayment() {
    setError("");

    try {
      const amountInPaise = ACCOUNT_CREATION_FEE * 100; // Convert to paise

      await initiatePayment({
        amount: amountInPaise,
        name: "Health UPI",
        description: "One Time Account Creation Fee",
        metadata: {
          type: "account_creation",
          doctor_email: form.email,
        },
        onSuccess: (paymentId: string, orderId: string) => {
          setSuccess(true);
          set("isFeePaid", true);
          console.log("Payment successful:", paymentId, orderId);
          
          // Optionally proceed to next step after payment
          setTimeout(() => {
            onNext?.();
          }, 1500);
        },
        onError: (error: string) => {
          setError(error || "Payment failed. Please try again.");
        },
      });
    } catch (error: any) {
      setError(error.message || "Payment failed. Please try again.");
    }
  }

  function handleSkip() {
    reset(); // Reset before skipping
    setError("");
    setSuccess(false);
    onNext?.();
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✅ Payment successful! Your account is being created.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">
        One Time Account Creation Fee
      </h2>

      <p className="text-sm text-muted-foreground">
        Complete your registration by paying a one-time fee of ₹1,000 or skip
        for now and pay later.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {paymentError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {paymentError}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <Button
          size="lg"
          disabled={paymentLoading}
          onClick={handlePayment}
          className="gap-1.5 flex-1 min-w-50"
        >
          {paymentLoading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay ₹{ACCOUNT_CREATION_FEE}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={handleSkip}
          disabled={paymentLoading}
          className="flex-1 min-w-50"
        >
          Skip for Now
        </Button>
      </div>
    </div>
  );
}
