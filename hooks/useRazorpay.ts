import { useCallback, useState } from "react";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";

interface PaymentOptions {
  amount: number;
  name: string;
  description: string;
  metadata?: {
    type: "appointment" | "registration";
    patient_id?: string;
    doctor_id?: string;
    appointment_id?: string;
    [key: string]: any;
  };
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
      if (state.loading) return; // 🔥 prevent double click

      setState({ loading: true, error: null, success: false });

      try {
        // ✅ SDK checks
        if (error) {
          throw new Error(
            "Payment gateway failed to load. Check your internet connection.",
          );
        }

        if (isLoading) {
          throw new Error("Payment SDK is still loading");
        }

        if (!Razorpay) {
          throw new Error("Razorpay SDK not available");
        }

        const { metadata } = options;

        // ✅ Validate metadata
        if (!metadata?.type) {
          throw new Error("Payment type is required");
        }

        if (metadata.type === "appointment") {
          if (!metadata.patient_id || !metadata.doctor_id) {
            throw new Error(
              "patient_id and doctor_id required for appointment",
            );
          }
        }

        if (metadata.type === "registration") {
          if (!metadata.doctor_id) {
            throw new Error("doctor_id required for registration");
          }
        }

        // ✅ Create order
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: options.amount,
            type: metadata.type,
            patient_id: metadata.patient_id,
            doctor_id: metadata.doctor_id,
            metadata,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create order");
        }

        const { orderId, amount, currency } = await res.json();

        // ✅ Razorpay config
        const rzpOptions: RazorpayOrderOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount,
          currency,
          order_id: orderId,
          name: options.name,
          description: options.description,

          prefill: {
            name: options.name,
          },

          theme: {
            color: "#6366f1",
          },

          handler: async (response) => {
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

              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Payment verification failed");
              }

              setState({ loading: false, error: null, success: true });

              options.onSuccess?.(
                response.razorpay_payment_id,
                response.razorpay_order_id,
              );
            } catch (err: any) {
              const msg = err.message || "Verification failed";
              setState({ loading: false, error: msg, success: false });
              options.onError?.(msg);
            }
          },

          modal: {
            ondismiss: () => {
              const msg = "Payment cancelled by user";
              setState({ loading: false, error: msg, success: false });
              options.onError?.(msg);
            },
          },
        };

        const rzpInstance = new Razorpay(rzpOptions);

        // ✅ Handle failure
        rzpInstance.on("payment.failed", (response: any) => {
          const msg =
            response.error?.description || "Payment failed. Please try again.";
          setState({ loading: false, error: msg, success: false });
          options.onError?.(msg);
        });

        rzpInstance.open();
      } catch (err: any) {
        const msg = err.message || "Something went wrong";
        setState({ loading: false, error: msg, success: false });
        options.onError?.(msg);
      }
    },
    [Razorpay, error, isLoading, state.loading],
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return {
    initiatePayment,
    loading: state.loading,
    error: state.error,
    success: state.success,
    reset,
  };
}
