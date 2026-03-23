"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClientBrowser } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  sendOTP: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  emailForAuth?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseClient = createClientBrowser();

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabaseClient.auth.getUser();

        if (authError) {
          console.log("Auth initialization:", authError.message);
          setUser(null);
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const sendOTP = async (phone: string): Promise<{ success: boolean; message: string }> => {
    try {
      setError(null);

      // Use Supabase's built-in OTP generation
      // Supabase will generate OTP internally and call our SMS Hook
      const { error } = await supabaseClient.auth.signInWithOtp({
        phone: `+91${phone}`, // Add country code
      });

      if (error) {
        console.error("❌ OTP send error:", error.message);
        setError(error.message);
        return { success: false, message: error.message };
      }

      console.log("✅ OTP sent successfully via Supabase Auth");
      return { success: true, message: "OTP sent successfully" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      setError(message);
      return { success: false, message };
    }
  };

  const verifyOTP = async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setError(null);

      console.log("🔐 Verifying OTP with Supabase Auth...");

      // Use Supabase's built-in OTP verification
      // This will verify the OTP and create a session automatically
      const { error, data } = await supabaseClient.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: "sms",
      });

      if (error) {
        console.error("❌ OTP verification error:", error.message);
        setError(error.message);
        return { success: false, message: error.message };
      }

      if (data.session) {
        console.log("✅ OTP verified, session created");
        setUser(data.user || null);
        return { success: true, message: "OTP verified successfully" };
      } else {
        console.error("⚠️ OTP verified but no session returned");
        setError("Session creation failed");
        return { success: false, message: "Session creation failed" };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("❌ verifyOTP error:", message);
      return { success: false, message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      const { error: signOutError } = await supabaseClient.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to logout";
      setError(message);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    sendOTP,
    verifyOTP,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use Auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
