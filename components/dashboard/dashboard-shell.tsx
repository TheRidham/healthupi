"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ServicesManagement } from "./services-management"
import { FollowUpManagement } from "./followup-management"
import { TimeSlots } from "./time-slots"
import { CallsSection } from "./calls-section"
import { PersonalDetails } from "./personal-details"
import { DashboardHeader } from "./dashboard-header"
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

const PROFILE_SUBTABS = [
  { key: "services", label: "Services", icon: Stethoscope },
  { key: "followup", label: "Follow-up", icon: RotateCcw },
  { key: "timeslots", label: "Time Slots", icon: Clock },
] as const

interface DashboardShellProps {
  doctorId?: string
}

export function DashboardShell({ doctorId = "andrew-mitchell" }: DashboardShellProps) {
  const [profileTab, setProfileTab] = useState<string>("services")
  const [copied, setCopied] = useState(false)

  const profileUrl = `healthupi.app/dr/${doctorId}`

  function handleCopyLink() {
    navigator.clipboard.writeText(`https://${profileUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6">
        {/* Page title */}
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

        {/* Main Section Tabs */}
        <Tabs defaultValue="profile" className="gap-6">
          <TabsList className="w-full md:w-auto h-10">
            <TabsTrigger value="profile" className="gap-1.5">
              <Settings className="size-4" />
              <span className="hidden sm:inline">Manage Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="calls" className="gap-1.5">
              <PhoneCall className="size-4" />
              <span className="hidden sm:inline">Calls & Sessions</span>
              <span className="sm:hidden">Calls</span>
            </TabsTrigger>
            <TabsTrigger value="personal" className="gap-1.5">
              <UserCircle className="size-4" />
              <span className="hidden sm:inline">Personal Details</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
          </TabsList>

          {/* Manage Profile Content */}
          <TabsContent value="profile">
            <div className="flex flex-col gap-6">
              {/* Profile sub-tabs using shadcn Button */}
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Profile sections">
                {PROFILE_SUBTABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = profileTab === tab.key
                  return (
                    <Button
                      key={tab.key}
                      role="tab"
                      aria-selected={isActive}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProfileTab(tab.key)}
                      className="gap-1.5"
                    >
                      <Icon className="size-3.5" />
                      {tab.label}
                    </Button>
                  )
                })}
              </div>

              <Separator />

              {/* Sub section content */}
              <div role="tabpanel">
                {profileTab === "services" && <ServicesManagement />}
                {profileTab === "followup" && <FollowUpManagement />}
                {profileTab === "timeslots" && <TimeSlots />}
              </div>
            </div>
          </TabsContent>

          {/* Calls Content */}
          <TabsContent value="calls">
            <CallsSection />
          </TabsContent>

          {/* Personal Details Content */}
          <TabsContent value="personal">
            <PersonalDetails />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
