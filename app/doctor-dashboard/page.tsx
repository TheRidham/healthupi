"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientBrowser } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { User, LayoutGrid, LogOut, Stethoscope } from "lucide-react"
import ProfileTab from "@/components/doctor-dashboard/ProfileTab"
import ServicesTab from "@/components/doctor-dashboard/ServiceTab"

type Tab = "profile" | "services"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientBrowser()
  const [activeTab, setActiveTab] = useState<Tab>("profile")

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Doctor Portal</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700 gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tab Switcher */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit mb-6">
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
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "services" && <ServicesTab />}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}