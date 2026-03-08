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
      console.log("patient profile", profile);
      setPatientProfile(profile)
      return profile
    } catch (error) {
      console.error("Error loading patient profile:", error)
      return null
    }
  }

  useEffect(() => {
    let hasInitialized = false

    const buildUserFromSession = async (session: any) => {
      if (!session?.user) return null

      // Check if this is a doctor
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('user_id, email, first_name, last_name, photo_url, designation')
        .eq('user_id', session.user.id)
        .single()

      if (doctorProfile) {
        return {
          id: session.user.id,
          role: "doctor" as const,
          avatar: doctorProfile?.photo_url,
          name: `${doctorProfile.first_name} ${doctorProfile.last_name}`.trim(),
          email: doctorProfile.email,
          createdAt: new Date(),
          designation: doctorProfile?.designation,
        }
      }

      // Check if this is a patient
      const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('user_id, name, email, photo_url')
        .eq('user_id', session.user.id)
        .single()

      if (patientProfile) {
        const profile = await loadPatientProfile(session.user.id)
        return {
          id: session.user.id,
          role: "patient" as const,
          avatar: profile?.photo_url,
          name: profile?.name || "",
          email: profile?.email || undefined,
          createdAt: new Date(),
        }
      }

      return null
    }

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        switch (event) {
          case 'INITIAL_SESSION':
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED': {
            const userData = await buildUserFromSession(session)
            if (userData) {
              setUser(userData)
            } else {
              setUser(null)
            }
            break
          }
          case 'SIGNED_OUT': {
            setUser(null)
            setPatientProfile(null)
            break
          }
        }
      } catch (error) {
        console.error("Error processing auth state change:", error)
      } finally {
        // Mark initialization as complete after first auth state change
        if (!hasInitialized) {
          hasInitialized = true
          setIsLoading(false)
        }
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
