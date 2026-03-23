"use client";

import { useState, useEffect } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Zap,
} from "lucide-react";

declare global {
  interface Window { Razorpay: any; }
}

type Props = {
  doctorId: string;
  doctorName: string;
  email: string;
  phone: string;
  onPayNowSuccess: () => void;
  onPayLater: () => void;
};

// Registration fee — edit as needed
const AMOUNT_PAISE = 99900; // ₹999
const CURRENCY = "INR";

type PaymentState = "idle" | "creating_order" | "awaiting_payment" | "verifying" | "success";
type Choice = "now" | "later" | null;

export default function StepPayment({
  doctorId,
  doctorName,
  email,
  phone,
  onPayNowSuccess,
  onPayLater,
}: Props) {
  const supabase = createClientBrowser();
  const [choice, setChoice] = useState<Choice>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handlePayNow = async () => {
    setErrorMsg(null);
    setPaymentState("creating_order");

    try {
      // 1. Create Razorpay order
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: AMOUNT_PAISE, currency: CURRENCY, doctorId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create payment order");
      }

      const { orderId } = await res.json();

      // 2. Insert pending registration record
      const { error: insertError } = await supabase.from("doctor_registrations").insert({
        doctor_id: doctorId,
        razorpay_order_id: orderId,
        amount_paise: AMOUNT_PAISE,
        currency: CURRENCY,
        status: "pending",
      });

      if (insertError) throw insertError;

      setPaymentState("awaiting_payment");

      // 3. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: AMOUNT_PAISE,
        currency: CURRENCY,
        name: "Doctor Registration",
        description: "One-time registration fee",
        order_id: orderId,
        prefill: { name: doctorName, email, contact: phone },
        theme: { color: "#2563eb" },

        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setPaymentState("verifying");
          try {
            // 4. Verify signature
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            // 5. Mark as paid
            const { error: updateError } = await supabase
              .from("doctor_registrations")
              .update({
                razorpay_payment_id: response.razorpay_payment_id,
                status: "paid",
                paid_at: new Date().toISOString(),
              })
              .eq("razorpay_order_id", response.razorpay_order_id);

            if (updateError) throw updateError;

            setPaymentState("success");
            setTimeout(onPayNowSuccess, 1500);
          } catch (err: any) {
            setPaymentState("idle");
            setErrorMsg(err.message || "Verification failed. Contact support.");
          }
        },

        modal: {
          ondismiss: async () => {
            await supabase
              .from("doctor_registrations")
              .update({ status: "failed" })
              .eq("razorpay_order_id", orderId);
            setPaymentState("idle");
            setErrorMsg("Payment was cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPaymentState("idle");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (paymentState === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Payment Successful!</h3>
        <p className="text-sm text-gray-500">Your registration is complete. Redirecting…</p>
      </div>
    );
  }

  const isLoading =
    paymentState === "creating_order" ||
    paymentState === "awaiting_payment" ||
    paymentState === "verifying";

  return (
    <div className="space-y-6">
      {/* Fee summary */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex items-center gap-2 text-gray-700 mb-4">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Registration Fee</span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-200 pt-4">
          <div>
            <p className="text-sm font-medium text-gray-900">One-time Doctor Registration</p>
            <p className="text-xs text-gray-500 mt-0.5">Lifetime access · No renewals</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            ₹{(AMOUNT_PAISE / 100).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Choice cards */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Choose a payment option</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Pay Now */}
          <button
            type="button"
            onClick={() => setChoice("now")}
            className={cn(
              "rounded-xl border-2 p-4 text-left transition-all",
              choice === "now"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mb-3",
              choice === "now" ? "bg-blue-600" : "bg-gray-100"
            )}>
              <Zap className={cn("w-4 h-4", choice === "now" ? "text-white" : "text-gray-500")} />
            </div>
            <p className={cn("font-semibold text-sm", choice === "now" ? "text-blue-700" : "text-gray-800")}>
              Pay Now
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Get instant access. Profile goes live immediately.
            </p>
          </button>

          {/* Pay Later */}
          <button
            type="button"
            onClick={() => setChoice("later")}
            className={cn(
              "rounded-xl border-2 p-4 text-left transition-all",
              choice === "later"
                ? "border-amber-500 bg-amber-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mb-3",
              choice === "later" ? "bg-amber-500" : "bg-gray-100"
            )}>
              <Clock className={cn("w-4 h-4", choice === "later" ? "text-white" : "text-gray-500")} />
            </div>
            <p className={cn("font-semibold text-sm", choice === "later" ? "text-amber-700" : "text-gray-800")}>
              Pay Later
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Complete setup now, pay when you're ready.
            </p>
          </button>
        </div>
      </div>

      {/* Pay Later notice */}
      {choice === "later" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          Your profile will be saved but <strong>not visible to patients</strong> until payment is complete.
          You can pay anytime from your dashboard.
        </div>
      )}

      {/* Trust badge */}
      <div className="flex items-start gap-2 text-sm text-gray-500">
        <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
        <p>Secured by Razorpay. Payment info is encrypted and never stored on our servers.</p>
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
              {paymentState === "creating_order" && "Creating order…"}
              {paymentState === "awaiting_payment" && "Opening payment…"}
              {paymentState === "verifying" && "Verifying payment…"}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pay ₹{(AMOUNT_PAISE / 100).toLocaleString("en-IN")} with Razorpay
            </span>
          )}
        </Button>
      )}

      {choice === "later" && (
        <Button
          variant="outline"
          className="w-full h-11 text-base font-medium border-amber-400 text-amber-700 hover:bg-amber-50"
          onClick={onPayLater}
        >
          <Clock className="w-4 h-4 mr-2" />
          Skip for Now — I'll Pay Later
        </Button>
      )}

      {!choice && (
        <Button className="w-full h-11 text-base" disabled>
          Select an option above to continue
        </Button>
      )}

      <p className="text-xs text-center text-gray-400">
        By continuing, you agree to our Terms of Service and Registration Policy.
      </p>
    </div>
  );
}