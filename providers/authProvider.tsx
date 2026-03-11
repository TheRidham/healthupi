"use client";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useCallback,
} from "react";
import { supabaseClient } from "../lib/supabase-client";

const supabase = supabaseClient;

type UserRole = "doctor" | "patient" | null;

interface AuthUser {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt?: Date;
  designation?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  patientProfile: any | null;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [patientProfile, setPatientProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use refs to prevent race conditions and memory leaks
  const hasInitialized = useRef(false);
  const isMounted = useRef(true);

  // Load patient profile from DB with proper cleanup
  const loadPatientProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error loading patient profile:", error);
        return null;
      }

      // Only update state if component is still mounted
      if (isMounted.current) {
        console.log("patient profile", profile);
        setPatientProfile(profile);
      }

      return profile;
    } catch (error) {
      console.error("Error loading patient profile:", error);
      return null;
    }
  }, []);

  const buildUserFromSession = useCallback(
    async (session: any) => {
      if (!session?.user) return null;

      try {
        // Check if this is a doctor
        const { data: doctorProfile, error: doctorError } = await supabase
          .from("doctor_profiles")
          .select(
            "user_id, email, first_name, last_name, photo_url, designation",
          )
          .eq("user_id", session.user.id)
          .single();

        if (doctorProfile && !doctorError) {
          return {
            id: session.user.id,
            role: "doctor" as const,
            avatar: doctorProfile.photo_url || undefined,
            name: `${doctorProfile.first_name} ${doctorProfile.last_name}`.trim(),
            email: doctorProfile.email,
            createdAt: new Date(),
            designation: doctorProfile.designation || undefined,
          };
        }

        // Check if this is a patient
        const { data: patientProfile, error: patientError } = await supabase
          .from("patient_profiles")
          .select("user_id, name, email, photo_url")
          .eq("user_id", session.user.id)
          .single();

        if (patientProfile && !patientError) {
          // Load full profile
          const fullProfile = await loadPatientProfile(session.user.id);

          return {
            id: session.user.id,
            role: "patient" as const,
            avatar: fullProfile?.photo_url || undefined,
            name: fullProfile?.name || "",
            email: fullProfile?.email || undefined,
            createdAt: new Date(),
          };
        }

        return null;
      } catch (error) {
        console.error("Error building user from session:", error);
        return null;
      }
    },
    [loadPatientProfile],
  );

  useEffect(() => {
    isMounted.current = true;

    // Listen for Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event);

      try {
        switch (event) {
          case "INITIAL_SESSION": {
            if (session?.user) {
              const userData = await buildUserFromSession(session);
              if (isMounted.current) {
                setUser(userData);
              }
            } else {
              if (isMounted.current) {
                setUser(null);
                setPatientProfile(null);
              }
            }
            break;
          }
          case "SIGNED_IN":
          case "TOKEN_REFRESHED": {
            const userData = await buildUserFromSession(session);
            if (isMounted.current) {
              setUser(userData);
            }
            break;
          }
          case "SIGNED_OUT": {
            if (isMounted.current) {
              setUser(null);
              setPatientProfile(null);
            }
            break;
          }
        }
      } catch (error) {
        console.error("Error processing auth state change:", error);
        if (isMounted.current) {
          setUser(null);
          setPatientProfile(null);
        }
      } finally {
        // Mark initialization as complete after first auth state change
        if (!hasInitialized.current && isMounted.current) {
          hasInitialized.current = true;
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [buildUserFromSession]);

  const login = useCallback(
    (userData: AuthUser) => {
      if (!isMounted.current) return;

      setUser(userData);

      // If patient, load profile (only if not already loaded)
      if (userData.role === "patient" && userData.id) {
        loadPatientProfile(userData.id);
      }
    },
    [loadPatientProfile],
  );

  const logout = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }

    // Clear all state
    if (isMounted.current) {
      setUser(null);
      setPatientProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.role === "patient" && user?.id) {
      await loadPatientProfile(user.id);
    }
  }, [user, loadPatientProfile]);

  return (
    <AuthContext.Provider
      value={{ user, patientProfile, login, logout, isLoading, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
