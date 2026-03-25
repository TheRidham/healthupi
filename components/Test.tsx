"use client";

import { usePayment } from "@/hooks/useRazorpay";

export default function TestPaymentButton() {
  const { initiatePayment, loading } = usePayment();

  const handleTestPayment = () => {
    initiatePayment({
      amount: 100, // ₹1 (minimum)
      name: "Test Payment",
      description: "Razorpay Test",

      metadata: {
        type: "registration", // 🔥 change to "appointment" to test that flow
        doctor_id: "f849145a-e9e3-487b-91ff-3203f9eaf92a", // replace with real UUID
      },

      onSuccess: () => {
        alert("Payment Successful ✅");
      },

      onError: (err) => {
        alert("Error: " + err);
      },
    });
  };

  return (
    <button
      onClick={handleTestPayment}
      disabled={loading}
      style={{
        padding: "10px 20px",
        background: "#6366f1",
        color: "white",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
      }}
    >
      {loading ? "Processing..." : "Pay ₹1"}
    </button>
  );
}