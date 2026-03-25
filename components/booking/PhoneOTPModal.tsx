"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle, LoaderCircle, Phone, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

interface PhoneOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userId: string, phone: string) => void;
}

type OTPStep = "phone" | "otp" | "success";

export default function PhoneOTPModal({
  isOpen,
  onClose,
  onSuccess,
}: PhoneOTPModalProps) {
  const { sendOTP, verifyOTP } = useAuth();

  const [step, setStep] = useState<OTPStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep("phone");
      setPhone("");
      setOtp("");
      setError(null);
      setResendTimer(0);
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!phone.trim() || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const result = await sendOTP(phone);

      if (result.success) {
        setStep("otp");
        setResendTimer(120); // 2 minutes
        setOtp("");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(phone, otp);

      if (result.success) {
        setStep("success");
        // Get the authenticated user ID
        const supabase = (await import("@/lib/supabase/client")).createClientBrowser();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.id) {
          setTimeout(() => {
            onSuccess(user.id, phone);
            handleClose();
          }, 1500);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (loading || resendTimer > 0) return;

    setError(null);
    setLoading(true);

    try {
      const result = await sendOTP(phone);

      if (result.success) {
        setResendTimer(120);
        setOtp("");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Phone Number</DialogTitle>
          <DialogDescription>
            {step === "phone" && "We'll send you an OTP to verify your account"}
            {step === "otp" && "Enter the OTP sent to your phone"}
            {step === "success" && "Phone verified successfully!"}
          </DialogDescription>
        </DialogHeader>

        {step === "success" ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-500/20 border border-green-500 rounded-full p-4 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-center text-foreground font-semibold mb-2">
              Phone verified successfully!
            </p>
            <p className="text-center text-sm text-foreground/60">
              You can now proceed with your booking
            </p>
          </div>
        ) : step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Phone Number *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  className="pl-12 bg-secondary/50 border-secondary/50"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-foreground/50">e.g., 9876543210</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Send OTP
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-foreground">
                Enter OTP *
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest bg-secondary/50 border-secondary/50 font-mono"
                disabled={loading}
              />
              <p className="text-xs text-foreground/50 text-center">
                OTP sent to +91 {phone}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify OTP
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-foreground/60 mb-2">
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : "Didn't receive the OTP?"}
              </p>
              {resendTimer === 0 && (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-primary hover:text-primary/90 p-0"
                >
                  Resend OTP
                </Button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
              }}
              disabled={loading}
              className="w-full"
            >
              Change Phone Number
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
