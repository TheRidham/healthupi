"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "@/lib/supabase"

type UserRole = "doctor" | "patient" | null

interface AuthUser {
  id: string
  email?: string
  name: string
  role: UserRole
  avatar?: string
  createdAt?: Date
  designation?: string
}

interface AuthContextType {
  user: AuthUser | null
  patientProfile: any | null
  isLoading: boolean
  login: (user: AuthUser) => void
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [patientProfile, setPatientProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load patient profile from DB
  const loadPatientProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error("Error loading patient profile:", error)
        return null
      }
      setPatientProfile(profile)
      return profile
    } catch (error) {
      console.error("Error loading patient profile:", error)
      return null
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Step 1: Check Supabase session (for doctors)
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Check if this is a doctor by looking up doctor_profiles
          const { data: doctorProfile } = await supabase
            .from('doctor_profiles')
            .select('user_id, email, first_name, last_name, photo_url, designation')
            .eq('user_id', session.user.id)
            .single()

          if (doctorProfile) {
            // User is a doctor
            const userData: AuthUser = {
              id: session.user.id,
              role: "doctor",
              avatar: doctorProfile?.photo_url,
              name: `${doctorProfile.first_name} ${doctorProfile.last_name}`.trim(),
              email: doctorProfile.email,
              createdAt: new Date(),
              designation: doctorProfile?.designation,
            }
            setUser(userData)
            setIsLoading(false)
            return
          }
        }

        // Step 2: Check if this is a patient (by looking up patient_profiles)
        // Supabase session already exists at this point, so just check if they're in patient_profiles
        if (session?.user?.id) {
          const { data: patientProfile } = await supabase
            .from('patient_profiles')
            .select('user_id, name, email, photo_url')
            .eq('user_id', session.user.id)
            .single()

          console.log("setUserData: ", patientProfile);

          if (patientProfile) {
            // User is a patient
            const profile = await loadPatientProfile(session.user.id)
            const userData: AuthUser = {
              id: session.user.id,
              role: "patient",
              avatar: profile?.photo_url,
              name: profile?.name || "",
              email: profile?.email || undefined,
              createdAt: new Date(),
            }
            setUser(userData)
            setIsLoading(false)
            return
          }
        }

        // Step 3: No session found
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking session:", error)
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for Supabase auth state changes (for doctors)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if doctor
        const { data: doctorProfile } = await supabase
          .from('doctor_profiles')
          .select('user_id, email, first_name, last_name')
          .eq('user_id', session.user.id)
          .single()

        if (doctorProfile) {
          const userData: AuthUser = {
            id: session.user.id,
            role: "doctor",
            name: `${doctorProfile.first_name} ${doctorProfile.last_name}`.trim(),
            email: doctorProfile.email,
            createdAt: new Date(),
          }
          setUser(userData)
          return
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear all auth state
        setUser(null)
        setPatientProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = (userData: AuthUser) => {
    setUser(userData)

    // If patient, load profile
    if (userData.role === 'patient') {
      loadPatientProfile(userData.id)
    }
  }

  const logout = async () => {
    try {
      // Sign out from Supabase (for doctors)
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }

    // Clear all state
    setUser(null)
    setPatientProfile(null)
  }

  const refreshProfile = async () => {
    if (user?.role === 'patient' && user?.id) {
      await loadPatientProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, patientProfile, login, logout, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
