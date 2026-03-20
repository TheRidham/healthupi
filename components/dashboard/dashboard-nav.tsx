"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/providers/authProvider"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Settings,
  PhoneCall,
  UserCircle,
  Stethoscope,
  RotateCcw,
  Clock,
  Share2,
  Check,
  Copy,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

const PROFILE_SUBTABS = [
  { key: "services", label: "Services", icon: Stethoscope },
  { key: "followup", label: "Follow-up", icon: RotateCcw },
  { key: "timeslots", label: "Time Slots", icon: Clock },
] as const

const MAIN_TABS = [
  { key: "services", label: "Manage Profile", icon: Settings, label_short: "Profile" },
  { key: "calls", label: "Calls & Sessions", icon: PhoneCall, label_short: "Calls" },
  { key: "personal", label: "Personal Details", icon: UserCircle, label_short: "Details" },
] as const

export function DashboardNav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

  console.log("DEBUG: ",user?.id)

  const doctorId = user?.id || "doctor"
  const profileUrl = `https://healthupi.vercel.app/doctor/${doctorId}`

  function handleCopyLink() {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isProfileRoute = pathname.includes(`/dashboard/${doctorId}/services`) ||
    pathname.includes(`/dashboard/${doctorId}/followup`) ||
    pathname.includes(`/dashboard/${doctorId}/timeslots`)

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6 md:px-6 overflow-x-hidden">
      {/* Page title with share button */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight text-balance">
            Doctor Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your practice, consultations, and personal information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center h-9 rounded-md border border-border bg-muted/50 pl-3 pr-1 text-sm text-muted-foreground">
            <span className="truncate max-w-[180px] select-all">{profileUrl}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-1 shrink-0"
                  onClick={handleCopyLink}
                  aria-label="Copy profile link"
                >
                  {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy link"}</TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyLink}>
                <Share2 className="size-3.5" />
                <span className="hidden sm:inline">Share Profile</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share your public profile URL</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Main Section Navigation */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2" role="tablist">
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname.includes(`/dashboard/${doctorId}/${tab.key}`) ||
              (tab.key === "services" && isProfileRoute)
            const href = `/dashboard/${doctorId}/${tab.key}`

            return (
              <Link key={tab.key} href={href}>
                <Button
                  role="tab"
                  aria-selected={isActive}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label_short}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Profile sub-tabs (only show when in profile section) */}
        {isProfileRoute && (
          <>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Profile sections">
              {PROFILE_SUBTABS.map((tab) => {
                const Icon = tab.icon
                const isActive = pathname.includes(`/${tab.key}`) ||
                  (tab.key === "services" && isProfileRoute &&
                    !pathname.includes("/followup") &&
                    !pathname.includes("/timeslots"))
                const href = `/dashboard/${doctorId}/${tab.key}`

                return (
                  <Link key={tab.key} href={href}>
                    <Button
                      role="tab"
                      aria-selected={isActive}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Icon className="size-3.5" />
                      {tab.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
            <Separator />
          </>
        )}
      </div>
    </div>
  )
}