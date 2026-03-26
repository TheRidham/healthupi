"use client";
import { useState } from "react";
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
import Link from "next/link";
import { createClientBrowser } from "@/lib/supabase/client";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const supabase = createClientBrowser();

  const handleSignIn = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Real Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Get doctor name from metadata or email
      const doctorId = data.user.id;
      // Wait a moment for context to update
      setSuccess(`Welcome back!`);
      setTimeout(() => {
        router.push(`/doctor-dashboard`);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-primary/5 via-background to-accent/5">
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg">
          {/* ── Header ── */}
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Doctor Log In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>

          {/* ── Form ── */}
          <form onSubmit={handleSignIn}>
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
                  autoComplete="current-password"
                />
              </div>

              <Link
                className="text-blue-700 text-xs text-right hover:underline"
                href={"/doctor/forget-password"}
              >
                <p className="text-right">Forget Password</p>
              </Link>

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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm capitalize"
                onClick={() => router.push("/doctor/signup")}
              >
                new to healthupi ? create an account
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
