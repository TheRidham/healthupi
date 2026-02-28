"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Video,
  MessageSquare,
  Siren,
  RotateCcw,
  Clock,
  ArrowRight,
  User,
  Calendar,
  Info,
} from "lucide-react"
import { useRouter } from "next/navigation"

type SessionType =
  | "video"
  | "chat"
  | "followup-video"
  | "followup-chat"
  | "emergency"

interface ActiveSession {
  id: string
  patientName: string
  patientAge: number
  type: SessionType
  startedAt: string
  duration: string
  status: "live" | "waiting"
}

interface UpcomingSession {
  id: string
  patientName: string
  patientAge: number
  type: SessionType
  scheduledAt: string
  scheduledDate: string
  issue: string
}

const SESSION_CONFIG: Record<
  SessionType,
  {
    label: string
    icon: React.ReactNode
    color: string
    bgColor: string
    borderColor: string
  }
> = {
  emergency: {
    label: "Emergency",
    icon: <Siren className="size-4" />,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
  video: {
    label: "Video Call",
    icon: <Video className="size-4" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  chat: {
    label: "Chat",
    icon: <MessageSquare className="size-4" />,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
  },
  "followup-video": {
    label: "Follow-up Video",
    icon: <RotateCcw className="size-4" />,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/20",
  },
  "followup-chat": {
    label: "Follow-up Chat",
    icon: <RotateCcw className="size-4" />,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/20",
  },
}

const MOCK_ACTIVE: ActiveSession[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    patientAge: 34,
    type: "emergency",
    startedAt: "2 min ago",
    duration: "00:02:14",
    status: "live",
  },
  {
    id: "2",
    patientName: "Michael Chen",
    patientAge: 45,
    type: "video",
    startedAt: "15 min ago",
    duration: "00:15:32",
    status: "live",
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    patientName: "Priya Patel",
    patientAge: 28,
    type: "chat",
    startedAt: "5 min ago",
    duration: "00:05:10",
    status: "live",
  },
  {
    id: "4",
    patientName: "James Wilson",
    patientAge: 52,
    type: "followup-video",
    startedAt: "8 min ago",
    duration: "00:08:45",
    status: "live",
  },
  {
    id: "5",
    patientName: "Emily Davis",
    patientAge: 29,
    type: "followup-chat",
    startedAt: "Just now",
    duration: "00:00:30",
    status: "waiting",
  },
]

const MOCK_UPCOMING: UpcomingSession[] = [
  {
    id: "u1",
    patientName: "Robert Brown",
    patientAge: 60,
    type: "video",
    scheduledAt: "11:00 AM",
    scheduledDate: "Today",
    issue: "Routine checkup",
  },
  {
    id: "u2",
    patientName: "Lisa Anderson",
    patientAge: 38,
    type: "chat",
    scheduledAt: "11:30 AM",
    scheduledDate: "Today",
    issue: "Medication follow-up",
  },
  {
    id: "u3",
    patientName: "David Kim",
    patientAge: 42,
    type: "followup-video",
    scheduledAt: "02:00 PM",
    scheduledDate: "Today",
    issue: "Post-surgery review",
  },
  {
    id: "u4",
    patientName: "Nina Gonzalez",
    patientAge: 25,
    type: "video",
    scheduledAt: "09:00 AM",
    scheduledDate: "Tomorrow",
    issue: "Skin consultation",
  },
  {
    id: "u5",
    patientName: "Tom Harris",
    patientAge: 55,
    type: "chat",
    scheduledAt: "10:30 AM",
    scheduledDate: "Tomorrow",
    issue: "Lab results discussion",
  },
  {
    id: "u6",
    patientName: "Anna White",
    patientAge: 31,
    type: "followup-chat",
    scheduledAt: "03:00 PM",
    scheduledDate: "Mar 1",
    issue: "Treatment progress",
  },
]

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "emergency", label: "Emergency" },
  { value: "video", label: "Video" },
  { value: "chat", label: "Chat" },
  { value: "followup-video", label: "F/U Video" },
  { value: "followup-chat", label: "F/U Chat" },
]

export function CallsSection() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const filteredActive =
    activeFilter === "all"
      ? MOCK_ACTIVE
      : MOCK_ACTIVE.filter((s) => s.type === activeFilter)

  // Sort: emergencies always first
  const sortedActive = [...filteredActive].sort((a, b) => {
    if (a.type === "emergency" && b.type !== "emergency") return -1
    if (a.type !== "emergency" && b.type === "emergency") return 1
    return 0
  })

  const handleChatAction = (session: ActiveSession) => {
    router.push(`/chat/${session.id}`);
  }

  const handleSessionAction = (session: ActiveSession) => {
    switch(session.type) {
      case "chat":
        handleChatAction(session);
        break;
      default:
        alert("Specify handler for session type.")
    }
  }


  return (
    <div className="flex flex-col gap-6">
      {/* Active / Ongoing Sessions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Active Sessions
            </h3>
            <p className="text-sm text-muted-foreground">
              Currently ongoing consultations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Active sessions info">
                  <Info className="size-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Emergency sessions always appear first
              </TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-foreground">
                {MOCK_ACTIVE.length} Live
              </span>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter sessions">
          {FILTER_OPTIONS.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              className="rounded-full h-8 px-3.5 text-xs font-medium"
              onClick={() => setActiveFilter(filter.value)}
              role="radio"
              aria-checked={activeFilter === filter.value}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-3">
          {sortedActive.map((session) => {
            const config = SESSION_CONFIG[session.type]
            return (
              <Card
                key={session.id}
                className={`py-0 transition-all border ${config.borderColor} ${
                  session.type === "emergency"
                    ? "ring-1 ring-destructive/20"
                    : ""
                }`}
              >
                <CardContent className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.color}`}
                      >
                        {config.icon}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">
                            {session.patientName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.patientAge}y
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${config.bgColor} ${config.color} border-none text-[10px] px-1.5 py-0`}
                          >
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {session.startedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                          {session.duration}
                        </span>
                        {session.status === "live" ? (
                          <div className="flex items-center gap-1">
                            <div className="size-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-[10px] font-medium text-accent">
                              LIVE
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-chart-4">
                            WAITING
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={session.type === "emergency" ? "destructive" : "default"}
                        onClick={() => handleSessionAction(session)}
                      >
                        {session.type.includes("chat") ? "Open Chat" : "Join Call"}
                        <ArrowRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Upcoming / Scheduled */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Upcoming Schedule
            </h3>
            <p className="text-sm text-muted-foreground">
              Booked appointments and scheduled consultations
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Calendar className="size-3" />
            {MOCK_UPCOMING.length} upcoming
          </Badge>
        </div>

        <div className="grid gap-2">
          {MOCK_UPCOMING.map((session) => {
            const config = SESSION_CONFIG[session.type]
            return (
              <Card key={session.id} className="py-0">
                <CardContent className="px-5 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                        <User className="size-4" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">
                            {session.patientName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.patientAge}y
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${config.bgColor} ${config.color} border-none text-[10px] px-1.5 py-0`}
                          >
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {session.issue}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {session.scheduledAt}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {session.scheduledDate}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                        <ArrowRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
