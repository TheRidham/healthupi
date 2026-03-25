"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, LoaderCircle, Check, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { BookingFormData, SelectedSlot } from "@/types/booking";
import { useAuth } from "@/context/AuthProvider";

interface PaymentModalProps {
  doctorId: string;
  doctorName: string;
  selectedServices: Array<{ id: string; name: string; fee?: number }>;
  selectedSlot: SelectedSlot;
  patientData: BookingFormData;
  onPaymentSuccess: (orderId: string) => void;
  onBack: () => void;
  onCancel: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function PaymentModal({
  doctorId,
  doctorName,
  selectedServices,
  selectedSlot,
  patientData,
  onPaymentSuccess,
  onBack,
  onCancel,
}: PaymentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Calculate total fees
  const totalFee = selectedServices.reduce((sum, service) => sum + (service.fee || 0), 0);
  const totalInPaise = totalFee * 100;

  // Load Razorpay script
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create order
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalInPaise,
          currency: "INR",
          type: "appointment",
          patient_id: user?.id,
          doctor_id: doctorId,
          metadata: {
            patientName: patientData.fullName,
            appointmentDate: selectedSlot.date,
            serviceName: selectedServices[0]?.name,
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      const { orderId } = orderData;

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderId,
        amount: totalInPaise,
        currency: "INR",
        name: `HealthUp - Appointment with Dr. ${doctorName}`,
        description: `${selectedServices[0]?.name} - ${format(
          new Date(selectedSlot.date),
          "MMM d, yyyy"
        )}`,
        customer_notify: 1,
        prefill: {
          name: patientData.fullName,
          contact: patientData.mobileNumber,
          email: patientData.email,
        },
        handler: async (response: RazorpayResponse) => {
          setVerifying(true);

          try {
            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || "Payment verification failed");
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onPaymentSuccess(response.razorpay_order_id);
            } else {
              throw new Error("Payment signature verification failed");
            }
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to verify payment. Please contact support."
            );
          } finally {
            setVerifying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
      setLoading(false);
    }
  };

  const appointmentDate = format(new Date(selectedSlot.date), "MMM d, yyyy");
  const appointmentTime = `${selectedSlot.startTime.slice(0, 5)} - ${selectedSlot.endTime.slice(
    0,
    5
  )}`;

  return (
    <Card className="p-6 sm:p-8 mb-8 border-primary/30 bg-card">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Payment Confirmation</h2>
        <p className="text-foreground/70">Review your booking details and proceed to payment</p>
      </div>

      {/* Booking Summary */}
      <div className="mb-8 p-4 rounded-lg bg-secondary/30 border border-secondary/50">
        <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">Doctor</p>
            <p className="font-semibold text-foreground">Dr. {doctorName}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">Service</p>
            <p className="font-semibold text-foreground">{selectedServices[0]?.name}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">Date & Time</p>
            <p className="font-semibold text-foreground">
              {appointmentDate} • {appointmentTime}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">Duration</p>
            <p className="font-semibold text-foreground">{selectedSlot.duration} minutes</p>
          </div>
        </div>

        <div className="pt-4 border-t border-secondary/50">
          <p className="text-xs font-semibold text-foreground/60 uppercase mb-2">Patient Name</p>
          <p className="font-semibold text-foreground">{patientData.fullName}</p>
        </div>
      </div>

      {/* Fees Breakdown */}
      <div className="mb-8 p-4 rounded-lg bg-background border border-border">
        <h3 className="font-semibold text-foreground mb-4">Fee Breakdown</h3>

        <div className="space-y-3">
          {selectedServices.map((service, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-foreground">{service.name}</p>
                <p className="text-xs text-foreground/50">1 × ₹{service.fee || 0}</p>
              </div>
              <p className="font-semibold text-foreground">₹{service.fee || 0}</p>
            </div>
          ))}

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <p className="font-semibold text-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">₹{totalFee}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-8">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading Message */}
      {verifying && (
        <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 mb-8">
          <LoaderCircle className="w-4 h-4 animate-spin text-primary" />
          <p className="text-sm font-semibold text-foreground">Verifying payment...</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 py-6"
          disabled={loading || verifying}
        >
          ← Back
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading || verifying || totalFee === 0}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
        >
          {loading ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : verifying ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ₹{totalFee}
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-foreground/50 mt-4 text-center">
        Your payment is secured by Razorpay
      </p>
    </Card>
  );
}
