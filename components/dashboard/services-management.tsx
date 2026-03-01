"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Video, MessageSquare, Home, Siren, CreditCard, Info, Loader2, RotateCcw, Plus } from "lucide-react"

interface ServiceConfig {
  id: string
  name: string
  icon: React.ReactNode
  enabled: boolean
  fee: number
  description: string
  type: string
}

const iconMap: Record<string, React.ReactNode> = {
  video: <Video className="size-5" />,
  message: <MessageSquare className="size-5" />,
  home: <Home className="size-5" />,
  alert: <Siren className="size-5" />,
  'credit-card': <CreditCard className="size-5" />,
  'rotate-ccw': <RotateCcw className="size-5" />,
}

function getIcon(iconName: string) {
  return iconMap[iconName?.toLowerCase()] || <Video className="size-5" />
}

export function ServicesManagement() {
  const pathname = usePathname()
  const doctorId = pathname?.split('/')[2] || ''
  
  const [services, setServices] = useState<ServiceConfig[]>([])
  const [followups, setFollowups] = useState<ServiceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [addingServices, setAddingServices] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [error, setError] = useState("")

  const fetchServices = async () => {
    if (!doctorId) return
    
    try {
      const response = await fetch(`/api/doctor/${doctorId}/services`)
      const result = await response.json()
      
      if (result.success) {
        setServices(result.data.services || [])
        setFollowups(result.data.followups || [])
      } else {
        setError(result.error || 'Failed to load services')
      }
    } catch (err) {
      console.error('[Services Management] Error:', err)
      setError('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [doctorId])

  const toggleService = async (serviceId: string, currentEnabled: boolean) => {
    console.log('[Services Management] Toggling service:', serviceId, 'currentEnabled:', currentEnabled, 'doctorId:', doctorId)
    setSaving(serviceId)
    
    try {
      const response = await fetch(`/api/doctor/${doctorId}/services`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          enabled: !currentEnabled,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setServices(prev => prev.map(s => 
          s.id === serviceId ? { ...s, enabled: !currentEnabled } : s
        ))
        setFollowups(prev => prev.map(s => 
          s.id === serviceId ? { ...s, enabled: !currentEnabled } : s
        ))
      } else {
        setError(result.error || 'Failed to update service')
      }
    } catch (err) {
      console.error('[Services Management] Error toggling:', err)
      setError('Failed to update service')
    } finally {
      setSaving(null)
    }
  }

  const updatePrice = async (serviceId: string, currentFee: number, newFee: string) => {
    const fee = parseInt(newFee) || currentFee
    console.log('[Services Management] Updating price:', serviceId, 'newFee:', fee, 'doctorId:', doctorId)
    setSaving(serviceId)
    
    try {
      const response = await fetch(`/api/doctor/${doctorId}/services`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          fee: fee,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setServices(prev => prev.map(s => 
          s.id === serviceId ? { ...s, fee } : s
        ))
        setFollowups(prev => prev.map(s => 
          s.id === serviceId ? { ...s, fee } : s
        ))
      } else {
        setError(result.error || 'Failed to update fee')
      }
    } catch (err) {
      console.error('[Services Management] Error updating price:', err)
      setError('Failed to update fee')
    } finally {
      setSaving(null)
    }
  }

  const addDefaultServices = async () => {
    setLoadingAvailable(true)
    setShowAddDialog(true)
    try {
      const response = await fetch(`/api/doctor/${doctorId}/services?action=available`)
      const result = await response.json()
      
      if (result.success) {
        setAvailableServices(result.data || [])
      } else {
        setError(result.error || 'Failed to load services')
      }
    } catch (err) {
      console.error('[Services Management] Error loading services:', err)
      setError('Failed to load services')
    } finally {
      setLoadingAvailable(false)
    }
  }

  const addService = async (serviceId: string, defaultPrice: number) => {
    setSaving(serviceId)
    try {
      const response = await fetch(`/api/doctor/${doctorId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          service_id: serviceId,
          fee: defaultPrice,
          enabled: true 
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchServices()
        setAvailableServices(prev => prev.filter(s => s.id !== serviceId))
      } else {
        setError(result.error || 'Failed to add service')
      }
    } catch (err) {
      console.error('[Services Management] Error adding service:', err)
      setError('Failed to add service')
    } finally {
      setSaving(null)
    }
  }

  const allServices = [...services, ...followups]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin" />
      </div>
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

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {allServices.length === 0 ? (
        <Card className="py-8">
          <CardContent className="text-center text-muted-foreground">
            <p className="mb-4">No services configured. Add services to start accepting appointments.</p>
            <Button 
              variant="outline" 
              onClick={addDefaultServices}
              disabled={addingServices}
            >
              {addingServices ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Plus className="size-4 mr-2" />}
              Add Services
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="sm" onClick={addDefaultServices}>
              <Plus className="size-4 mr-2" />
              Add Service
            </Button>
          </div>
          <div className="grid gap-3">
            {services.length > 0 && (
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Regular Services
              </div>
            )}
            {services.map((service) => (
              <Card
                key={service.id}
                className={`py-4 transition-all ${
                  service.enabled
                    ? "border-primary/20 bg-primary/[0.02]"
                    : "opacity-70"
                }`}
              >
                <CardContent className="px-4 py-0 md:px-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                          service.enabled
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {getIcon(service.icon as string)}
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
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto sm:ml-0">
                      <div className="flex items-center gap-1.5" data-disabled={!service.enabled}>
                        <Label
                          htmlFor={`price-${service.id}`}
                          className="text-xs text-muted-foreground font-medium"
                        >
                          ₹
                        </Label>
                        <Input
                          id={`price-${service.id}`}
                          type="number"
                          value={service.fee}
                          onChange={(e) => {
                            const newFee = e.target.value
                            setServices(prev => prev.map(s => 
                              s.id === service.id ? { ...s, fee: parseInt(newFee) || 0 } : s
                            ))
                            setFollowups(prev => prev.map(s => 
                              s.id === service.id ? { ...s, fee: parseInt(newFee) || 0 } : s
                            ))
                          }}
                          onBlur={(e) => updatePrice(service.id, service.fee, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updatePrice(service.id, service.fee, (e.target as HTMLInputElement).value)
                            }
                          }}
                          className="w-20 h-8 text-sm text-right"
                          disabled={!service.enabled || saving === service.id}
                          aria-label={`${service.name} price`}
                        />
                      </div>
                      <Switch
                        id={`switch-${service.id}`}
                        checked={service.enabled}
                        onCheckedChange={() => toggleService(service.id, service.enabled)}
                        disabled={saving === service.id}
                        aria-label={`Toggle ${service.name}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {followups.length > 0 && (
              <>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 mt-4">
                  Follow-up Services
                </div>
                {followups.map((service) => (
                  <Card
                    key={service.id}
                    className={`py-4 transition-all ${
                      service.enabled
                        ? "border-primary/20 bg-primary/[0.02]"
                        : "opacity-70"
                    }`}
                  >
                    <CardContent className="px-4 py-0 md:px-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                              service.enabled
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {getIcon(service.icon as string)}
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
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto sm:ml-0">
                          <div className="flex items-center gap-1.5" data-disabled={!service.enabled}>
                            <Label
                              htmlFor={`price-${service.id}`}
                              className="text-xs text-muted-foreground font-medium"
                            >
                              ₹
                            </Label>
                          <Input
                            id={`price-${service.id}`}
                            type="number"
                            value={service.fee}
                            onChange={(e) => {
                              const newFee = e.target.value
                              setFollowups(prev => prev.map(s => 
                                s.id === service.id ? { ...s, fee: parseInt(newFee) || 0 } : s
                              ))
                            }}
                            onBlur={(e) => updatePrice(service.id, service.fee, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updatePrice(service.id, service.fee, (e.target as HTMLInputElement).value)
                              }
                            }}
                            className="w-20 h-8 text-sm text-right"
                            disabled={!service.enabled || saving === service.id}
                            aria-label={`${service.name} price`}
                          />
                          </div>
                          <Switch
                            id={`switch-${service.id}`}
                            checked={service.enabled}
                            onCheckedChange={() => toggleService(service.id, service.enabled)}
                            disabled={saving === service.id}
                            aria-label={`Toggle ${service.name}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
            <DialogDescription>
              Select a service to add to your profile
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loadingAvailable ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : availableServices.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">All services have been added</p>
            ) : (
              availableServices.map((service) => (
                <div 
                  key={service.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getIcon(service.icon)}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => addService(service.id, service.price)}
                    disabled={saving === service.id}
                  >
                    {saving === service.id ? <Loader2 className="size-4 animate-spin" /> : 'Add'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
