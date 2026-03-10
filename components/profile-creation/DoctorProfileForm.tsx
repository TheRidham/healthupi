"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { DoctorFormData, defaultFormData } from "@/lib/type";

import { StepIndicator, STEPS } from "./StepIndicator";
import { FormNavigation } from "./FormNavigation";
import { SuccessScreen } from "./SuccessScreen";
import { submitDoctorProfile } from "@/lib/type";

// Steps
import { Step0Account } from "./steps/Step0Account";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";
import { Step2Professional } from "./steps/Step2Professional";
import { Step3Clinic } from "./steps/Step3Clinic";
import { Step4Contact } from "./steps/Step4Contact";
import { Step5Additional } from "./steps/Step5Additional";

export default function DoctorProfileForm() {
  const [step, setStep] = useState<string>("basicInfo");
  const [form, setForm] = useState<DoctorFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof DoctorFormData, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const prev = () => {
    setError("");
    const currentIndex = STEPS.findIndex(s => s.id === step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1].id);
    }
  };

  // ── Next: advance to next step ───
  const next = async () => {
    setError("");
    const currentIndex = STEPS.findIndex(s => s.id === step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1].id);
    }
  };

  // ── Final submit: create account then save profile ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Validate passwords
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      
      // Create account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      
      if (!data.user?.id) {
        setError("Failed to create account. Please try again.");
        return;
      }
      
      // Save profile with new user ID
      await submitDoctorProfile(form, data.user.id);
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(defaultFormData);
    setStep("basicInfo");
    setSubmitted(false);
    setError("");
    setUserId("");
  };

  if (submitted) {
    return (
      <SuccessScreen
        firstName={form.firstName}
        lastName={form.lastName}
        onReset={handleReset}
      />
    );
  }

  const stepProps = { form, set };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Stethoscope className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              Doctor Onboarding
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {STEPS.find(s => s.id === step)?.label}
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <StepIndicator currentStep={step} />

        {/* ── Form Card ── */}
        <Card className="bg-card border shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={step}>
                {step === "basicInfo" && <Step1BasicInfo {...stepProps} />}
                {step === "professional" && <Step2Professional {...stepProps} />}
                {step === "clinic" && <Step3Clinic {...stepProps} />}
                {step === "contact" && <Step4Contact {...stepProps} />}
                {step === "payment" && <Step5Additional {...stepProps} onNext={next} />}
                {step === "account" && <Step0Account {...stepProps} />}
              </div>

              {/* Error */}
              {error && (
                <p className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5">
                  {error}
                </p>
              )}

              {/* Navigation */}
              <FormNavigation
                step={step}
                totalSteps={STEPS.length}
                loading={loading}
                onPrev={prev}
                onNext={next}
                hideNext={step === "payment"}
                isFirstStep={step === "basicInfo"}
              />
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          All information is kept secure and confidential.
        </p>
      </div>
    </div>
  );
}
