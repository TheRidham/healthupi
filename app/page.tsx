"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import {
  Stethoscope,
  User,
  ArrowRight,
  Loader2,
  Shield,
  Calendar,
  MessageSquare,
  Video,
  CreditCard,
} from "lucide-react"

const MOCK_DOCTOR_CREDENTIALS = {
  id: "dr001",
  username: "doctor",
  password: "doctor123",
}

export default function HomePage() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleDoctorLogin() {
    setLoading(true)
    setError("")

    setTimeout(() => {
      if (username === MOCK_DOCTOR_CREDENTIALS.username && password === MOCK_DOCTOR_CREDENTIALS.password) {
        router.push("/dashboard")
      } else {
        setError("Invalid credentials. Try: doctor / doctor123")
      }
      setLoading(false)
    }, 800)
  }

  function handlePatientFlow() {
    router.push("/doctors")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Stethoscope className="size-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            HealthUPI
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your complete healthcare platform
          </p>
        </div>

        {!showLogin ? (
          <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
            <Card className="group cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all" onClick={() => setShowLogin(true)}>
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Stethoscope className="size-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Doctor Login</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Access your dashboard, manage appointments, and consult patients
                  </p>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  Login as Doctor
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all" onClick={handlePatientFlow}>
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="size-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <User className="size-7 text-accent group-hover:text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Patient / User</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Find doctors, book appointments, and manage your health
                  </p>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground">
                  Continue as Patient
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => setShowLogin(false)}>
                  <ArrowRight className="size-4 rotate-180" />
                </Button>
                <h2 className="text-lg font-semibold">Doctor Login</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button className="w-full" onClick={handleDoctorLogin} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Demo credentials: <span className="font-medium">doctor</span> / <span className="font-medium">doctor123</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Calendar, label: "Easy Booking" },
              { icon: Video, label: "Video Consultation" },
              { icon: MessageSquare, label: "Chat with Doctors" },
              { icon: CreditCard, label: "Secure Payments" },
            ].map((feature) => (
              <div key={feature.label} className="flex flex-col items-center gap-2 text-center">
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                  <feature.icon className="size-5 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="size-3.5" />
          <span>Secure & Private Healthcare Platform</span>
        </div>
      </div>
    </div>
  )
}
