"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -ml-48 -mb-48"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground mb-6 shadow-lg">
            <Stethoscope className="size-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3 bg-clip-text">
            HealthBase
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with healthcare professionals and manage your wellness journey in one secure platform
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto mb-16">
          <Card
            className="group cursor-pointer border-0 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
            onClick={() => router.push("/doctor/signin")}
          >
            <CardContent className="py-4 px-8 flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/15 transition-colors">
                <Stethoscope className="size-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Doctor Dashboard
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Manage schedules, appointments, and connect with patients seamlessly
                </p>
              </div>
              <Button
                onClick={() => router.push("/doctor/signin")}
                className="w-full h-10 bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 text-primary-foreground font-medium group-hover:shadow-lg transition-all"
              >
                Continue as Doctor
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer border-0 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
            onClick={() => router.push("/doctors")}
          >
            <CardContent className="py-4 px-8 flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center group-hover:from-accent/20 group-hover:to-accent/15 transition-colors">
                <User className="size-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Patient Portal
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Find specialists, book appointments, and manage your health records
                </p>
              </div>
              <Button
                className="w-full h-10 bg-gradient-to-r from-accent to-purple-600 hover:from-accent hover:to-purple-700 text-accent-foreground font-medium group-hover:shadow-lg transition-all"
                onClick={() => router.push("/doctors")}
              >
                Continue as Patient
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-2">Why Choose HealthBase?</h3>
            <p className="text-muted-foreground">Everything you need for better healthcare</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Calendar, label: "Easy Booking", desc: "Schedule appointments in seconds" },
              { icon: Video, label: "Video Calls", desc: "Secure video consultations" },
              { icon: MessageSquare, label: "Live Chat", desc: "Message doctors anytime" },
              { icon: CreditCard, label: "Safe Payments", desc: "Secure & encrypted" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="size-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 max-w-2xl mx-auto">
          <Shield className="size-4 flex-shrink-0 text-primary" />
          <span className="font-medium">Secure & Private • HIPAA Compliant • Data Encrypted</span>
        </div>
      </div>
    </div>
  );
}
