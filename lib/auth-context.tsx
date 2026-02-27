"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "@/lib/supabase"

type UserRole = "doctor" | "patient" | null

interface User {
  role: UserRole
  name: string
  id: string
  email?: string
}

interface AuthContextType {
  user: User | null
  login: (role: UserRole, name: string, id: string, email?: string) => void
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check Supabase session on load
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // User is logged in via Supabase
          const email = session.user.email || ""
          
          // Determine role based on email or metadata
          // For now, assume doctors use supabase auth
          const userData: User = {
            role: "doctor",
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Doctor",
            id: session.user.id,
            email: email
          }
          setUser(userData)
          localStorage.setItem("healthupi_user", JSON.stringify(userData))
        } else {
          // Check localStorage for patient login
          const stored = localStorage.getItem("healthupi_user")
          if (stored) {
            try {
              setUser(JSON.parse(stored))
            } catch {
              localStorage.removeItem("healthupi_user")
            }
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
      setIsLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData: User = {
          role: "doctor",
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "Doctor",
          id: session.user.id,
          email: session.user.email
        }
        setUser(userData)
        localStorage.setItem("healthupi_user", JSON.stringify(userData))
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        localStorage.removeItem("healthupi_user")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = (role: UserRole, name: string, id: string, email?: string) => {
    const newUser = { role, name, id, email }
    setUser(newUser)
    localStorage.setItem("healthupi_user", JSON.stringify(newUser))
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
    setUser(null)
    localStorage.removeItem("healthupi_user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
