"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  User,
  LayoutGrid,
  LogOut,
  Stethoscope,
  Calendar,
  CalendarDays,
} from "lucide-react";
import ProfileTab from "@/components/doctor-dashboard/ProfileTab";
import ServicesTab from "@/components/doctor-dashboard/ServiceTab";
import TimeSlotsTab from "@/components/doctor-dashboard/TimeslotTab";
import ScheduleTab from "@/components/doctor-dashboard/ScheduleTab";

type Tab = "profile" | "services" | "availability" | "schedule";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientBrowser();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Top Nav */}
      <header className="bg-gradient-to-r from-primary/5 via-card to-accent/5 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">
              Doctor Portal
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 gap-1.5 font-medium"
          >
            <LogOut className="w-4 h-4 text-accent" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tab Switcher */}
        <div className="flex gap-2 bg-card border border-border rounded-lg p-1.5 w-fit mb-6 shadow-sm">
          <TabButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={<User className="w-4 h-4" />}
            label="My Profile"
          />
          <TabButton
            active={activeTab === "services"}
            onClick={() => setActiveTab("services")}
            icon={<LayoutGrid className="w-4 h-4" />}
            label="Services"
          />
          <TabButton
            active={activeTab === "availability"}
            onClick={() => setActiveTab("availability")}
            icon={<Calendar className="w-4 h-4" />}
            label="Availability"
          />
          <TabButton
            active={activeTab === "schedule"}
            onClick={() => setActiveTab("schedule")}
            icon={<CalendarDays className="w-4 h-4" />}
            label="Schedule"
          />
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "availability" && <TimeSlotsTab />}
        {activeTab === "schedule" && <ScheduleTab />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      }`}
    >
      <span className={active ? "text-primary-foreground" : "text-primary"}>
        {icon}
      </span>
      {label}
    </button>
  );
}
