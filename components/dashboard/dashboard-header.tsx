"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Bell, Search } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="text-lg font-semibold text-foreground tracking-tight">
            HealthUPI
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, records..."
            className="w-64 pl-8 h-8 text-sm"
            aria-label="Search patients and records"
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-sm" className="relative" aria-label="Notifications">
              <Bell className="size-4" />
              <Badge className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center p-0 border-none">
                3
              </Badge>
            </Button>
          </TooltipTrigger>
          <TooltipContent>3 unread notifications</TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Avatar className="size-8">
            <AvatarImage src="/images/doctor-avatar.jpg" alt="Dr. Andrew Mitchell" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">AM</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-medium text-foreground leading-none">
              Dr. Mitchell
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
              Cardiologist
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
