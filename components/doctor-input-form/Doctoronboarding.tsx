"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

import StepPersonal from "./StepPersonal";
import StepProfessional from "./StepProfessional";
import StepPractice from "./StepPractice";
import StepContact from "./StepContact";
import StepAccount from "./StepAccount";
import StepPayment from "./StepPayment";

export type DoctorFormData = {
  // Personal
  photo_url: string;
  first_name: string;
  last_name: string;
  designation: string;
  about: string;
  languages: string[];

  // Professional
  specialization: string;
  sub_specialization: string;
  experience_years: number | "";
  qualifications: string[];
  registration_no: string;

  // Practice
  clinic_name: string;
  hospital: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  clinic_photo_urls: string[];

  // Contact & Availability
  phone: string;
  email: string;
  website: string;
  google_meet_link: string;
  availability: "online" | "offline" | "both";

  // Account
  account_email: string;
  account_password: string;
};

const INITIAL_DATA: DoctorFormData = {
  photo_url: "",
  first_name: "",
  last_name: "",
  designation: "",
  about: "",
  languages: [],

  specialization: "",
  sub_specialization: "",
  experience_years: "",
  qualifications: [],
  registration_no: "",

  clinic_name: "",
  hospital: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  clinic_photo_urls: [],

  phone: "",
  email: "",
  website: "",
  google_meet_link: "",
  availability: "offline",

  account_email: "",
  account_password: "",
};

// Steps: 0–3 = info, 4 = account, 5 = payment
const STEPS = [
  { title: "Personal", description: "Basic details about you" },
  { title: "Professional", description: "Your expertise & credentials" },
  { title: "Practice", description: "Clinic & hospital information" },
  { title: "Contact", description: "How patients reach you" },
  { title: "Account", description: "Create your login credentials" },
  { title: "Payment", description: "One-time registration fee" },
];

const ACCOUNT_STEP = 4;
const PAYMENT_STEP = 5;

export default function DoctorOnboardingPage() {
  const router = useRouter();
  const supabase = createClientBrowser();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DoctorFormData>(INITIAL_DATA);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  const updateFields = (fields: Partial<DoctorFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const next = () => {
    setError(null);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => {
    setError(null);
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  /**
   * Called on Step 4 (Account) — "Create Account & Continue"
   * 1. signUp with email + password
   * 2. Save doctor_profile using the new user's id
   * 3. Advance to payment step
   */
  const createAccountAndSaveProfile = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create Supabase auth account
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: formData.account_email,
          password: formData.account_password,
          options: {
            data: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              role: "doctor",
            },
          },
        });

      if (signUpError) throw signUpError;
      if (!signUpData.user)
        throw new Error("Account creation failed. Please try again.");

      const userId = signUpData.user.id;

      // 2. Save doctor profile
      const payload = {
        user_id: userId,
        email: formData.email || formData.account_email,
        photo_url: formData.photo_url || null,
        first_name: formData.first_name,
        last_name: formData.last_name || null,
        designation: formData.designation || null,
        about: formData.about || null,
        specialization: formData.specialization || null,
        sub_specialization: formData.sub_specialization || null,
        experience_years:
          formData.experience_years !== ""
            ? Number(formData.experience_years)
            : null,
        qualifications: formData.qualifications.length
          ? formData.qualifications
          : null,
        registration_no: formData.registration_no || null,
        clinic_name: formData.clinic_name || null,
        hospital: formData.hospital || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        clinic_photo_urls: formData.clinic_photo_urls.length
          ? formData.clinic_photo_urls
          : [],
        phone: formData.phone || null,
        website: formData.website || null,
        google_meet_link: formData.google_meet_link || null,
        languages: formData.languages.length ? formData.languages : null,
        availability: formData.availability,
      };

      const { data: profile, error: profileError } = await supabase
        .from("doctor_profiles")
        .insert({...payload, user_id: userId})
        .select("id")
        .single();

      if (profileError) throw profileError;

      setDoctorId(userId);
      next(); // → payment step
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const progressValue = ((currentStep + 1) / STEPS.length) * 100;
  const stepProps = { data: formData, updateFields };
  const isAccountStep = currentStep === ACCOUNT_STEP;
  const isPaymentStep = currentStep === PAYMENT_STEP;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Doctor Registration
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${
                    idx < currentStep
                      ? "bg-accent text-accent-foreground"
                      : idx === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
              >
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-xs mt-1 font-medium hidden sm:block
                ${idx === currentStep ? "text-primary" : "text-muted-foreground"}`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-6 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-blue-600 transition-all duration-300" 
            style={{ width: `${progressValue}%` }}
          />
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              {STEPS[currentStep].title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {STEPS[currentStep].description}
            </p>
          </div>

          {currentStep === 0 && <StepPersonal {...stepProps} />}
          {currentStep === 1 && <StepProfessional {...stepProps} />}
          {currentStep === 2 && <StepPractice {...stepProps} />}
          {currentStep === 3 && <StepContact {...stepProps} />}
          {currentStep === 4 && <StepAccount {...stepProps} />}
          {currentStep === 5 && (
            <StepPayment
              doctorId={doctorId!}
              doctorName={`${formData.first_name} ${formData.last_name}`.trim()}
              email={formData.account_email}
              phone={formData.phone}
              onPayNowSuccess={() => router.push("/doctor-dashboard")}
              onPayLater={() => router.push("/doctor-dashboard")}
            />
          )}

          {error && (
            <p className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 px-4 py-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Navigation — hidden on payment step */}
          {!isPaymentStep && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={back}
                disabled={currentStep === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>

              {isAccountStep ? (
                <Button
                  onClick={createAccountAndSaveProfile}
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 text-primary-foreground"
                >
                  {isProcessing
                    ? "Creating account…"
                    : "Create Account & Continue"}
                  {!isProcessing && <ChevronRight className="w-4 h-4" />}
                </Button>
              ) : (
                <Button onClick={next} className="flex items-center gap-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 text-primary-foreground">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
