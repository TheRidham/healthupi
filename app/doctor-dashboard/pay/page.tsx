"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePayment } from "@/hooks/useRazorpay";
import {
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Zap,
  ArrowLeft,
  XCircle,
} from "lucide-react";

const AMOUNT_PAISE = 99900; // ₹999

type PaymentState = "idle" | "processing" | "success";
type Choice = "now" | "later" | null;

type DoctorInfo = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  is_paid: boolean;
};

export default function DashboardPayPage() {
  const router = useRouter();
  const { initiatePayment, loading: hookLoading } = usePayment();

  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);

  const [loadingData, setLoadingData] = useState(true);

  const [choice, setChoice] = useState<Choice>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch doctor profile
  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setDoctor(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  const handlePayNow = async () => {
    if (!doctor) return;
    setErrorMsg(null);
    setPaymentState("processing");

    await initiatePayment({
      amount: AMOUNT_PAISE,
      name: "Doctor Registration",
      description: "One-time registration fee",
      metadata: {
        type: "registration",
        doctor_id: doctor.id,
      },
      onSuccess: () => {
        setPaymentState("success");
        setTimeout(() => router.push("/dashboard?payment=success"), 1500);
      },
      onError: (message) => {
        setPaymentState("idle");
        setErrorMsg(message || "Something went wrong. Please try again.");
      },
    });
  };

  const isLoading = paymentState === "processing" || hookLoading;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── Already paid ───────────────────────────────────────────────────────────
  if (doctor?.is_paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Already Paid</h2>
          <Button
            className="mt-6 w-full"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (paymentState === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Successful!
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Your profile is now live. Redirecting to dashboard…
          </p>
          <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Complete Registration
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Pay the one-time fee to make your profile visible to patients.
            </p>
          </div>

          {/* Pending banner */}
          {doctor?.is_paid === false && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <XCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                Your profile is currently <strong>not visible</strong> to
                patients until payment is complete.
              </p>
            </div>
          )}

          {/* Fee summary */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Registration Fee</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  One-time Doctor Registration
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Lifetime access · No renewals
                </p>
              </div>
              <p className="text-xl font-bold text-gray-900">
                ₹{(AMOUNT_PAISE / 100).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Choice cards */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Choose a payment option
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setChoice("now")}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  choice === "now"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-3",
                    choice === "now" ? "bg-blue-600" : "bg-gray-100",
                  )}
                >
                  <Zap
                    className={cn(
                      "w-4 h-4",
                      choice === "now" ? "text-white" : "text-gray-500",
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "font-semibold text-sm",
                    choice === "now" ? "text-blue-700" : "text-gray-800",
                  )}
                >
                  Pay Now
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Profile goes live immediately.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setChoice("later")}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  choice === "later"
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300 bg-white",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-3",
                    choice === "later" ? "bg-amber-500" : "bg-gray-100",
                  )}
                >
                  <Clock
                    className={cn(
                      "w-4 h-4",
                      choice === "later" ? "text-white" : "text-gray-500",
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "font-semibold text-sm",
                    choice === "later" ? "text-amber-700" : "text-gray-800",
                  )}
                >
                  Pay Later
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Remind me from dashboard.
                </p>
              </button>
            </div>
          </div>

          {/* Pay Later notice */}
          {choice === "later" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              Your profile will remain hidden from patients. You can return here
              anytime to complete payment.
            </div>
          )}

          {/* Trust badge */}
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <p>
              Secured by Razorpay. Payment info is encrypted and never stored on
              our servers.
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* CTA */}
          {choice === "now" && (
            <Button
              className="w-full h-11 text-base font-medium"
              onClick={handlePayNow}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing payment…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pay ₹{(AMOUNT_PAISE / 100).toLocaleString("en-IN")} with
                  Razorpay
                </span>
              )}
            </Button>
          )}

          {choice === "later" && (
            <Button
              variant="outline"
              className="w-full h-11 text-base font-medium border-amber-400 text-amber-700 hover:bg-amber-50"
              onClick={() => router.push("/dashboard")}
            >
              <Clock className="w-4 h-4 mr-2" />
              Remind Me Later
            </Button>
          )}

          {!choice && (
            <Button className="w-full h-11 text-base" disabled>
              Select an option above to continue
            </Button>
          )}

          <p className="text-xs text-center text-gray-400">
            By paying, you agree to our Terms of Service and Registration
            Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
