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
import { Video, MessageSquare, Home, Siren, CreditCard, Info } from "lucide-react"

interface ServiceConfig {
  id: string
  name: string
  icon: React.ReactNode
  enabled: boolean
  price: string
  description: string
}

export function ServicesManagement() {
  const [services, setServices] = useState<ServiceConfig[]>([
    {
      id: "video-call",
      name: "Video Call",
      icon: <Video className="size-5" />,
      enabled: true,
      price: "500",
      description: "One-on-one video consultation with patients",
    },
    {
      id: "chat",
      name: "Chat",
      icon: <MessageSquare className="size-5" />,
      enabled: true,
      price: "200",
      description: "Text-based consultation and messaging",
    },
    {
      id: "home-visit",
      name: "Home Visit",
      icon: <Home className="size-5" />,
      enabled: false,
      price: "1500",
      description: "In-person visit at patient's residence",
    },
    {
      id: "emergency",
      name: "Emergency",
      icon: <Siren className="size-5" />,
      enabled: true,
      price: "2000",
      description: "Urgent and emergency consultations",
    },
    {
      id: "subscription",
      name: "Subscription",
      icon: <CreditCard className="size-5" />,
      enabled: false,
      price: "3000",
      description: "Monthly subscription for unlimited consultations",
    },
  ])

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  const updatePrice = (id: string, price: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price } : s))
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Services</h3>
          <p className="text-sm text-muted-foreground">
            Enable or disable services and set your consultation fees
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Services info">
              <Info className="size-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Toggle services on/off and set your fee for each
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="grid gap-3">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`py-4 transition-all ${
              service.enabled
                ? "border-primary/20 bg-primary/[0.02]"
                : "opacity-70"
            }`}
          >
            <CardContent className="px-5 py-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                      service.enabled
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {service.icon}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">
                        {service.name}
                      </span>
                      <Badge
                        variant={service.enabled ? "default" : "secondary"}
                        className={
                          service.enabled
                            ? "bg-accent text-accent-foreground text-[10px] px-1.5 py-0"
                            : "text-[10px] px-1.5 py-0"
                        }
                      >
                        {service.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {service.description}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5" data-disabled={!service.enabled}>
                    <Label
                      htmlFor={`price-${service.id}`}
                      className="text-xs text-muted-foreground font-medium"
                    >
                      {'$'}
                    </Label>
                    <Input
                      id={`price-${service.id}`}
                      type="number"
                      value={service.price}
                      onChange={(e) => updatePrice(service.id, e.target.value)}
                      className="w-20 h-8 text-sm text-right"
                      disabled={!service.enabled}
                      aria-label={`${service.name} price`}
                    />
                  </div>
                  <Switch
                    id={`switch-${service.id}`}
                    checked={service.enabled}
                    onCheckedChange={() => toggleService(service.id)}
                    aria-label={`Toggle ${service.name}`}
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
