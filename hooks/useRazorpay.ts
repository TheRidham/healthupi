import { useCallback, useState } from "react";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { supabase } from "@/lib/supabase";

interface PaymentOptions {
  amount: number;
  name: string;
  description: string;
  metadata?: Record<string, any>;
  onSuccess?: (paymentId: string, orderId: string) => void;
  onError?: (error: string) => void;
}

interface PaymentState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function usePayment() {
  const { error, isLoading, Razorpay } = useRazorpay();

  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    success: false,
  });

  const initiatePayment = useCallback(
    async (options: PaymentOptions) => {
      setState({ loading: true, error: null, success: false });

      try {
        // 1. Check Razorpay SDK loaded correctly
        if (error) {
          throw new Error(
            "Payment gateway failed to load. Check your internet connection.",
          );
        }

        // 2. Verify user is logged in
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("You must be logged in to make a payment.");
        }

        // 3. Create order via your API route
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: options.amount,
            metadata: options.metadata,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || "Failed to create order. Please try again.",
          );
        }

        const { orderId, amount, currency } = await res.json();

        // 4. Configure Razorpay checkout — fully typed via RazorpayOrderOptions
        const rzpOptions: RazorpayOrderOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: amount,
          currency,
          order_id: orderId,
          name: options.name,
          description: options.description,
          prefill: {
            email: user.email,
          },
          theme: {
            color: "#6366f1",
          },
          handler: async (response) => {
            // UI feedback only — DB is updated via webhook
            // Verify payment server-side using KEY_SECRET
            try {
              const res = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!res.ok) throw new Error("Payment verification failed");
              setState({ loading: false, error: null, success: true });
              options.onSuccess?.(
                response.razorpay_payment_id,
                response.razorpay_order_id,
              );
            } catch (err: any) {
              setState({ loading: false, error: err.message, success: false });
              options.onError?.(err.message);
            }
          },
          modal: {
            ondismiss: () => {
              setState({
                loading: false,
                error: "Payment cancelled.",
                success: false,
              });
              options.onError?.("Payment cancelled by user.");
            },
          },
        };

        // 5. Open checkout
        const rzpInstance = new Razorpay(rzpOptions);

        rzpInstance.on("payment.failed", (response) => {
          const msg =
            response.error?.description || "Payment failed. Please try again.";
          setState({ loading: false, error: msg, success: false });
          options.onError?.(msg);
        });

        rzpInstance.open();
      } catch (err: any) {
        const msg = err.message || "Something went wrong.";
        setState({ loading: false, error: msg, success: false });
        options.onError?.(msg);
      }
    },
    [Razorpay, error],
  );

  return {
    initiatePayment,
    loading: state.loading || isLoading, // combines your loading + SDK loading
    error: state.error,
    success: state.success,
  };
}
