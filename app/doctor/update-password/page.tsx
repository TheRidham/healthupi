"use client";
import { useEffect, useState } from "react";
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
import { supabaseClient } from "@/lib/supabase-client";

export default function SignInForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const supabase = supabaseClient;

  // useEffect(() => {
  //   if (password != confirmPassword) {
  //     setSuccess("");
  //     setError("password not matching");
  //   }
  //   if(password.length > 0 && confirmPassword.length > 0 && password === confirmPassword) {
  //     setError("");
  //     setSuccess("password matched");
  //   }
  // }, [password, confirmPassword]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("session:", data);
    };

    checkSession();
  }, []);

  const updatePassword = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully!");
      router.replace("/doctor/signin");
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
              Update Password
            </CardTitle>
            <CardDescription>
              Enter your new password for your account
            </CardDescription>
          </CardHeader>

          {/* ── Form ── */}
          <CardContent className="space-y-4">
            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
              </div>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
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
          <CardFooter className="flex flex-col gap-3 mt-4">
            <Button
              onClick={updatePassword}
              className="w-full"
              disabled={loading}
            >
              {loading ? "processing..." : "Update Password"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
