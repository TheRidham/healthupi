"use client";

import { ReactNode, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

type PatientProfile = {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
  photo_url: string | null;
};

export default function DoctorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  useEffect(() => {
    fetch(`/api/patient/profile`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProfile(res.data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex flex-col">
      
      {/* 🔝 Header */}
      <header className="bg-gradient-to-r from-primary/5 via-card to-accent/5 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-base hidden sm:inline">
              HealthBase
            </span>
          </div>

          {/* 👤 Profile (clickable) */}
          {profile ? (
            <div
              onClick={() => router.push("/patient")}
              className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors duration-200"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground text-sm font-semibold">
                  {profile.name?.charAt(0).toUpperCase() || "P"}
                </span>
              </div>

              {/* Name */}
              <span className="text-sm font-semibold text-foreground hidden sm:inline">
                {profile.name || "Patient"}
              </span>
            </div>
          ) : (
            <Link
              href='/patient/login'
              className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors duration-200"
            >
              Log in
            </Link>
          )}
        </div>
      </header>

      {/* 📦 Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}