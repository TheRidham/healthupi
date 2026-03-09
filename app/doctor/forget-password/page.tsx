"use client";
import { useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
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
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const supabase = supabaseClient;

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://healthupi.vercel.app/doctor/update-password",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      alert(error.message);
    } else {
      setSuccess("Password reset email sent!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-primary/5 via-background to-accent/5">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg">
          {/* ── Header ── */}
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              Forget Password
            </CardTitle>
            <CardDescription>
              Enter your email to reset your account password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Success Message */}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                {success}
              </p>
            )}
          </CardContent>

          {/* ── Footer ── */}
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={handleReset} className="w-full" disabled={loading}>
              {loading ? "processing..." : "Reset Password"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
