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
import { useAuth } from "@/lib/auth-context";
import { Phone, Loader2, ShieldCheck, User, Mail, Calendar } from "lucide-react";

type Step = "phone" | "otp" | "profile";

const EXISTING_USERS: Record<string, { name: string; email: string }> = {
  "1234567890": { name: "Amita Sharma", email: "amita.sharma@email.com" },
  "9876543210": { name: "Priya Patel", email: "priya.patel@email.com" },
};

function PatientSignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";
  const { login } = useAuth();
  
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("1234567890");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Profile form for new users
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileGender, setProfileGender] = useState("");
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleSendOtp() {
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1000);
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
    const code = otp.join("");
    if (code !== "123456") {
      setError("Invalid OTP. Use 123456");
      return;
    }
    
    // Check if existing user
    const existingUser = EXISTING_USERS[phone];
    if (existingUser) {
      // Existing user - login directly
      setLoading(true);
      login("patient", existingUser.name, phone, existingUser.email);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
    } else {
      // New user - show profile form
      setLoading(false);
      setStep("profile");
    }
  }

  function handleProfileSubmit() {
    if (!profileName.trim() || !profileDob || !profileGender) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    login("patient", profileName, phone, profileEmail || undefined);
    setTimeout(() => {
      router.push(redirectUrl);
    }, 500);
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-primary/5 via-background to-accent/5">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Patient Login</CardTitle>
            <CardDescription>
              {step === "phone" && "Enter your phone number to continue"}
              {step === "otp" && "Enter the OTP sent to your phone"}
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
                <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
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
                <p className="text-xs text-muted-foreground text-center">Dummy OTP: <span className="font-medium">123456</span></p>
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
