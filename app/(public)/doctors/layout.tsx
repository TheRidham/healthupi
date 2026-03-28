"use client";

import { ReactNode, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* 🔝 Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              Patient
            </span>
          </div>

          {/* 👤 Profile (clickable) */}
          {profile && (
            <div
              onClick={() => router.push("/patient")}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {profile.name?.charAt(0).toUpperCase() || "P"}
                </span>
              </div>

              {/* Name */}
              <span className="text-sm font-medium text-gray-700">
                {profile.name || "Patient"}
              </span>
            </div>
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