"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/header";
import { Phone, Loader2, ShieldCheck, User, Mail, Calendar } from "lucide-react";
import { sendOtpToPhone, verifyPatientOtp, createPatientAccount } from "@/services/auth.service";
import { loginPatient } from "@/services/auth.service";
import { useAuth } from "@/lib/auth-context";
import { formatPhoneForDB } from "@/lib/utils/phone";

type Step = "phone" | "otp" | "profile";

function PatientSignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";
  const { login } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Profile form for new users
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileGender, setProfileGender] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleSendOtp() {
    console.log('[Signin Page] Sending OTP for phone:', phone)
    setError("");
    setLoading(true);

    sendOtpToPhone(phone)
      .then((result) => {
        console.log('[Signin Page] OTP send result:', result)
        setLoading(false);
        if (result.success) {
          setStep("otp");
        } else {
          setError(result.error || "Failed to send OTP. Please try again.");
        }
      })
      .catch((err) => {
        console.error('[Signin Page] OTP send error:', err)
        setLoading(false);
        setError("An error occurred. Please try again.");
      });
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleVerifyOtp() {
    console.log('[Signin Page] Verifying OTP for phone:', phone, 'otp:', otp.join(''))
    setError("");
    setLoading(true);

    verifyPatientOtp(phone, otp.join(""))
      .then((result) => {
        console.log('[Signin Page] OTP verification result:', result)
        setLoading(false);

        if (!result.success) {
          setError(result.error || "Verification failed. Please try again.");
          return;
        }

        if (result.isNewUser) {
          console.log('[Signin Page] New user detected, showing profile form')
          // New user - show profile form
          setStep("profile");
        } else if (result.userId && result.profile) {
          console.log('[Signin Page] Existing user detected, logging in')
          // Existing user - login directly
          loginPatient(result.userId, phone)
            .then((loginResult) => {
              console.log('[Signin Page] Login patient result:', loginResult)

              if (loginResult.success) {
                // Update auth context
                login({
                  id: result.userId!,
                  role: "patient",
                  name: result.profile.name,
                  email: result.profile.email,
                  createdAt: new Date(),
                });

                console.log('[Signin Page] Auth context updated, redirecting to:', redirectUrl)

                // Redirect
                setTimeout(() => {
                  console.log('[Signin Page] Redirecting now...')
                  router.push(redirectUrl);
                }, 500);
              } else {
                console.error('[Signin Page] Login failed:', loginResult.error)
                setError(loginResult.error || "Login failed. Please try again.");
              }
            })
            .catch((err) => {
              console.error('[Signin Page] Login error:', err)
              setError("An error occurred during login. Please try again.");
            });
        } else {
          console.error('[Signin Page] Unexpected OTP result:', result)
          setError("Unexpected error. Please try again.");
        }
      })
      .catch((err) => {
        console.error('[Signin Page] OTP verification error:', err)
        setLoading(false);
        setError("An error occurred. Please try again.");
      });
  }

  function handleProfileSubmit() {
    setError("");

    if (!profileName.trim() || !profileDob || !profileGender) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    createPatientAccount({
      phone,
      name: profileName,
      email: profileEmail || undefined,
      dateOfBirth: profileDob,
      gender: profileGender,
    })
      .then((result) => {
        setLoading(false);

        if (!result.success) {
          setError(result.error || "Failed to create account. Please try again.");
          return;
        }

        if (result.userId) {
          // Login the new user
          login({
            id: result.userId,
            role: "patient",
            name: result.profile?.name || profileName,
            email: result.profile?.email || profileEmail,
            createdAt: new Date(),
          });

          // Redirect
          setTimeout(() => {
            router.push(redirectUrl);
          }, 500);
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("An error occurred. Please try again.");
      });
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-primary/5 via-background to-accent/5">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Patient Login / Sign Up</CardTitle>
            <CardDescription>
              {step === "phone" && "Enter your phone number to login or sign up"}
              {step === "otp" && "Enter OTP sent to your phone"}
              {step === "profile" && "Complete your profile to continue"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "phone" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">+91</span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button className="w-full" onClick={handleSendOtp} disabled={loading || phone.length < 10}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Phone className="size-4 mr-2" />
                      Send OTP
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    OTP sent to <span className="font-medium">+91 {phone}</span>
                  </p>
                  <Button variant="link" size="sm" onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}>
                    Change number
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <div className="flex items-center justify-center gap-2">
                    {otp.map((digit, i) => (
                      <Input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="size-12 text-center text-lg font-semibold"
                        aria-label={`OTP digit ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <p className="text-xs text-muted-foreground text-center">
                  In development mode, any 6-digit code will be accepted
                </p>
                <Button className="w-full" onClick={handleVerifyOtp} disabled={loading || otp.join("").length < 6}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4 mr-2" />
                      Verify & Login
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === "profile" && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    Welcome! Please complete your profile
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <Input id="name" placeholder="Enter your name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="your@email.com" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <Input id="dob" type="date" value={profileDob} onChange={(e) => setProfileDob(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender <span className="text-red-500">*</span></Label>
                    <Select value={profileGender} onValueChange={setProfileGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button className="w-full" onClick={handleProfileSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete Profile & Continue"
                  )}
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function PatientSignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    }>
      <PatientSignInContent />
    </Suspense>
  );
}
