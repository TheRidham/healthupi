"use client";
import { usePayment } from "@/hooks/useRazorpay";

export default function PaymentButton() {
  const { initiatePayment, loading, error, success } = usePayment();

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
        ✅ Payment successful! Confirmation email on its way.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() =>
          initiatePayment({
            amount: 49900, // ₹499 in paise
            name: "Health UPI",
            description: "Doctor Consultation Fee",
            onSuccess: (paymentId) => console.log("Paid:", paymentId),
            onError: (err) => console.error("Error:", err),
          })
        }
        disabled={loading}
        className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold
                   hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Pay ₹499"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
