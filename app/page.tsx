"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Header } from "@/components/header";
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
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  function handlePatientFlow() {
    router.push("/doctors");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5">
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

        <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
          <Card
            className="group cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
            onClick={() => setShowLogin(true)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Stethoscope className="size-7 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Doctor Login
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Access your dashboard, manage appointments, and consult
                  patients
                </p>
              </div>
              <Button
                onClick={() => router.push("/signin")}
                variant="outline"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
              >
                Login as Doctor
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all"
            onClick={handlePatientFlow}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="size-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <User className="size-7 text-accent group-hover:text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Patient / User
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Find doctors, book appointments, and manage your health
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full group-hover:bg-accent group-hover:text-accent-foreground"
              >
                Continue as Patient
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Calendar, label: "Easy Booking" },
              { icon: Video, label: "Video Consultation" },
              { icon: MessageSquare, label: "Chat with Doctors" },
              { icon: CreditCard, label: "Secure Payments" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                  <feature.icon className="size-5 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {feature.label}
                </span>
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
  );
}
