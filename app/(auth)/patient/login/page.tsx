"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { Heart } from "lucide-react";

type LoginStep = "phone" | "otp";

export default function PatientLoginPage() {
  const router = useRouter();
  const { sendOTP, verifyOTP, isAuthenticated } = useAuth();

  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/patient");
    }
  }, [isAuthenticated, router]);

  // Countdown timer for resend
  React.useEffect(() => {
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
        setResendTimer(120);
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
        router.push("/patient");
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
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = () => {
    setStep("phone");
    setOtp("");
    setError(null);
    setResendTimer(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-md mx-auto mb-4">
            <Heart className="w-6 h-6 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">HealthBase</h1>
          <p className="text-muted-foreground">Patient Login</p>
        </div>

        <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
          {step === "phone" && (
            <form onSubmit={handleSendOTP} className="p-6 space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 bg-secondary border border-border rounded-lg text-muted-foreground font-medium">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">We'll send an OTP to verify your phone</p>
              </div>

              {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 disabled:bg-muted text-primary-foreground font-medium py-3 rounded-lg transition"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="p-6 space-y-4">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">OTP sent to</p>
                <p className="text-lg font-semibold text-foreground">+91{phone}</p>
                <button
                  type="button"
                  onClick={handleChangePhone}
                  className="text-sm text-primary hover:text-primary/80 mt-2 font-medium"
                >
                  Change phone number
                </button>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-1">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground mt-1">6-digit code sent via SMS (valid for 5 minutes)</p>
              </div>

              {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 disabled:bg-muted text-primary-foreground font-medium py-3 rounded-lg transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || loading}
                className="w-full text-primary hover:text-primary/80 disabled:text-muted-foreground font-medium py-2 text-sm"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}