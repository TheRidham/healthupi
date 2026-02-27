"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Video, MessageSquare, RotateCcw, Info } from "lucide-react"

interface FollowUpConfig {
  id: string
  name: string
  icon: React.ReactNode
  enabled: boolean
  price: string
  description: string
  discountNote: string
}

export function FollowUpManagement() {
  const [followUps, setFollowUps] = useState<FollowUpConfig[]>([
    {
      id: "followup-video",
      name: "Follow-up Video Call",
      icon: <Video className="size-5" />,
      enabled: true,
      price: "300",
      description: "Video follow-up for returning patients",
      discountNote: "Typically 40% less than initial consultation",
    },
    {
      id: "followup-chat",
      name: "Follow-up Chat",
      icon: <MessageSquare className="size-5" />,
      enabled: true,
      price: "100",
      description: "Text follow-up for returning patients",
      discountNote: "Typically 50% less than initial consultation",
    },
  ])

  const toggleFollowUp = (id: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    )
  }

  const updatePrice = (id: string, price: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, price } : f))
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Follow-up</h3>
          <RotateCcw className="size-4 text-muted-foreground" />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Follow-up info">
              <Info className="size-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Set reduced rates for returning patient follow-ups
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">
        Configure follow-up consultation options and pricing for returning patients
      </p>
      <div className="grid gap-3">
        {followUps.map((followUp) => (
          <Card
            key={followUp.id}
            className={`py-4 transition-all ${
              followUp.enabled
                ? "border-primary/20 bg-primary/[0.02]"
                : "opacity-70"
            }`}
          >
            <CardContent className="px-4 py-0 md:px-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                      followUp.enabled
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {followUp.icon}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">
                        {followUp.name}
                      </span>
                      <Badge
                        variant={followUp.enabled ? "default" : "secondary"}
                        className={
                          followUp.enabled
                            ? "bg-accent text-accent-foreground text-[10px] px-1.5 py-0"
                            : "text-[10px] px-1.5 py-0"
                        }
                      >
                        {followUp.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {followUp.description}
                    </span>
                    <span className="text-[11px] text-accent mt-0.5 font-medium">
                      {followUp.discountNote}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto sm:ml-0">
                  <div className="flex items-center gap-1.5" data-disabled={!followUp.enabled}>
                    <Label
                      htmlFor={`price-${followUp.id}`}
                      className="text-xs text-muted-foreground font-medium"
                    >
                      ₹
                    </Label>
                    <Input
                      id={`price-${followUp.id}`}
                      type="number"
                      value={followUp.price}
                      onChange={(e) => updatePrice(followUp.id, e.target.value)}
                      className="w-20 h-8 text-sm text-right"
                      disabled={!followUp.enabled}
                      aria-label={`${followUp.name} price`}
                    />
                  </div>
                  <Switch
                    id={`switch-${followUp.id}`}
                    checked={followUp.enabled}
                    onCheckedChange={() => toggleFollowUp(followUp.id)}
                    aria-label={`Toggle ${followUp.name}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
