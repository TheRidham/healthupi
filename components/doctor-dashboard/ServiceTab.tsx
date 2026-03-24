"use client";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  IndianRupee,
  Clock,
  MessageSquare,
  Video,
  CreditCard,
  Stethoscope,
  Siren,
  type LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Service = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  price: number; // base price from services table
  duration_minutes: number | null;
  icon: string | null;
};

type DoctorService = {
  service_id: string;
  enabled: boolean;
  fee: number; // doctor's custom fee
  // joined from services
  name: string;
  type: string;
  description: string | null;
  duration_minutes: number | null;
  icon: string | null;
};

const ICONS_BY_NAME: Record<string, LucideIcon> = {
  messagesquare: MessageSquare,
  message_square: MessageSquare,
  "message-square": MessageSquare,
  video: Video,
  creditcard: CreditCard,
  credit_card: CreditCard,
  "credit-card": CreditCard,
  stethoscope: Stethoscope,
  siren: Siren,
};

const getServiceIcon = (iconName: string | null): LucideIcon => {
  if (!iconName) return Stethoscope;
  const key = iconName.trim().toLowerCase();
  return ICONS_BY_NAME[key] ?? Stethoscope;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServicesTab() {
  const [myServices, setMyServices] = useState<DoctorService[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add service dialog
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [newFee, setNewFee] = useState("");

  // Edit fee dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DoctorService | null>(null);
  const [editFee, setEditFee] = useState("");
  const [saving, setSaving] = useState(false);

  // Inline toggle loading
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/services").then((r) => r.json()),
      fetch("/api/dashboard/services/available").then((r) => r.json()),
    ])
      .then(([mine, all]) => {
        if (mine.success) setMyServices(mine.data);
        else setError(mine.error ?? "Failed to load services");
        if (all.success) setAllServices(all.data);
      })
      .catch(() => setError("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  // Services not yet added by this doctor
  const addableServices = allServices.filter(
    (s) => !myServices.some((ms) => ms.service_id === s.id),
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleToggle = async (serviceId: string, enabled: boolean) => {
    setTogglingId(serviceId);
    try {
      const res = await fetch(`/api/dashboard/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error();
      setMyServices((prev) =>
        prev.map((s) => (s.service_id === serviceId ? { ...s, enabled } : s)),
      );
    } catch {
      // revert optimistic UI on failure — refetch
    } finally {
      setTogglingId(null);
    }
  };

  const openEditFee = (service: DoctorService) => {
    setEditTarget(service);
    setEditFee(service.fee.toString());
    setEditOpen(true);
  };

  const handleSaveFee = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/dashboard/services/${editTarget.service_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fee: parseFloat(editFee) || 0 }),
        },
      );
      if (!res.ok) throw new Error();
      setMyServices((prev) =>
        prev.map((s) =>
          s.service_id === editTarget.service_id
            ? { ...s, fee: parseFloat(editFee) || 0 }
            : s,
        ),
      );
      setEditOpen(false);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedService) return;
    setAdding(true);
    try {
      const res = await fetch("/api/dashboard/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService.id,
          fee: parseFloat(newFee) || 0,
          enabled: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMyServices((prev) => [
        ...prev,
        {
          service_id: selectedService.id,
          enabled: true,
          fee: parseFloat(newFee) || 0,
          name: selectedService.name,
          type: selectedService.type,
          description: selectedService.description,
          duration_minutes: selectedService.duration_minutes,
          icon: selectedService.icon,
        },
      ]);
      setAddOpen(false);
      setSelectedService(null);
      setNewFee("");
    } catch {
      // handle error
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (serviceId: string) => {
    setRemovingId(serviceId);
    try {
      const res = await fetch(`/api/dashboard/services/${serviceId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setMyServices((prev) => prev.filter((s) => s.service_id !== serviceId));
    } catch {
      // handle error
    } finally {
      setRemovingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">My Services</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {myServices.length} service{myServices.length !== 1 ? "s" : ""}{" "}
            added
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setAddOpen(true)}
          disabled={addableServices.length === 0}
        >
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {/* Services List */}
      {myServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm">No services added yet</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-1.5"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add your first service
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {myServices.map((service) => {
            const ServiceIcon = getServiceIcon(service.icon);
            return (
              <div
                key={service.service_id}
                className={`bg-white rounded-2xl border p-4 transition-all ${
                  service.enabled
                    ? "border-gray-100"
                    : "border-gray-100 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon placeholder */}
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-lg">
                    <ServiceIcon className="w-5 h-5 text-blue-700" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize"
                          >
                            {service.type}
                          </Badge>
                          {service.duration_minutes && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Clock className="w-3 h-3" />
                              {service.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle */}
                        {togglingId === service.service_id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <Switch
                            checked={service.enabled}
                            onCheckedChange={(val) =>
                              handleToggle(service.service_id, val)
                            }
                          />
                        )}

                        {/* Edit fee */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-gray-400 hover:text-gray-700"
                          onClick={() => openEditFee(service)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        {/* Remove */}
                        {removingId === service.service_id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-gray-400 hover:text-red-500"
                            onClick={() => handleRemove(service.service_id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Fee */}
                    <div className="flex items-center gap-1 mt-2">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800">
                        {service.fee > 0
                          ? service.fee.toLocaleString("en-IN")
                          : "Free"}
                      </span>
                      {service.fee === 0 && (
                        <span className="text-xs text-gray-400 ml-1">
                          — tap edit to set fee
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Service Dialog ─────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a Service</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {addableServices.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                All available services have been added.
              </p>
            ) : (
              <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                {addableServices.map((s) => {
                  const ServiceIcon = getServiceIcon(s.icon);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        selectedService?.id === s.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <ServiceIcon className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {s.name}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {s.type}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedService && (
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-700">
                  Your fee (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                setSelectedService(null);
                setNewFee("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!selectedService || adding}>
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Fee Dialog ────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Fee — {editTarget?.name}</DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Your fee (₹)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                min="0"
                value={editFee}
                onChange={(e) => setEditFee(e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFee} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
