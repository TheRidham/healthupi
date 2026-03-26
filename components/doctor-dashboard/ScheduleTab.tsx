"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  AlertCircle,
  CalendarX,
  ChevronRight,
  IndianRupee,
  Phone,
  Mail,
} from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "completed" | "cancelled" | "rescheduled";
  payment_status: "pending" | "paid" | "refunded";
  notes: string | null;
  patient: {
    name: string;
    email: string | null;
    phone: string | null;
    photo_url: string | null;
  };
  service: {
    name: string;
    type: string;
    duration_minutes: number | null;
  };
};

type GroupedAppointments = {
  today: Appointment[];
  upcoming: Appointment[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDateLabel(dateStr: string) {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
}

const STATUS_CONFIG: Record<
  Appointment["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  completed: {
    label: "Completed",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
  rescheduled: {
    label: "Rescheduled",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <RotateCcw className="w-3 h-3" />,
  },
};

const PAYMENT_CONFIG: Record<
  Appointment["payment_status"],
  { label: string; color: string }
> = {
  pending: { label: "Unpaid", color: "bg-amber-50 text-amber-700" },
  paid: { label: "Paid", color: "bg-green-50 text-green-700" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-500" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AppointmentCard({
  apt,
  showDate = false,
  onClick,
}: {
  apt: Appointment;
  showDate?: boolean;
  onClick: () => void;
}) {
  const status = STATUS_CONFIG[apt.status];
  const payment = PAYMENT_CONFIG[apt.payment_status];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4 cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all group"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
        {apt.patient.photo_url ? (
          <img
            src={apt.patient.photo_url}
            alt={apt.patient.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <User className="w-5 h-5 text-blue-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {apt.patient.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Stethoscope className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-500 truncate">
                {apt.service.name}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
        </div>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {/* Time */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatTime(apt.start_time)} – {formatTime(apt.end_time)}
          </div>

          {/* Date (for upcoming section) */}
          {showDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <CalendarDays className="w-3 h-3" />
              {formatDateLabel(apt.appointment_date)}
            </div>
          )}

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.color}`}
          >
            {status.icon}
            {status.label}
          </span>

          {/* Payment badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${payment.color}`}
          >
            <IndianRupee className="w-2.5 h-2.5" />
            {payment.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function AppointmentDialog({
  apt,
  open,
  onClose,
  onStatusChange,
}: {
  apt: Appointment | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: Appointment["status"]) => void;
}) {
  const [updating, setUpdating] = useState(false);

  if (!apt) return null;

  const status = STATUS_CONFIG[apt.status];
  const payment = PAYMENT_CONFIG[apt.payment_status];
  const canComplete = apt.status === "confirmed";
  const canCancel = apt.status === "confirmed" || apt.status === "rescheduled";

  const handleStatus = async (newStatus: Appointment["status"]) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/dashboard/appointments/${apt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onStatusChange(apt.id, newStatus);
        onClose();
      }
    } catch {
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Patient */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
              {apt.patient.photo_url ? (
                <img
                  src={apt.patient.photo_url}
                  alt={apt.patient.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {apt.patient.name}
              </p>
              {apt.patient.phone && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <Phone className="w-3 h-3" /> {apt.patient.phone}
                </div>
              )}
              {apt.patient.email && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Mail className="w-3 h-3" /> {apt.patient.email}
                </div>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <Detail
              label="Date"
              value={format(parseISO(apt.appointment_date), "MMM d, yyyy")}
            />
            <Detail
              label="Time"
              value={`${formatTime(apt.start_time)} – ${formatTime(apt.end_time)}`}
            />
            <Detail label="Service" value={apt.service.name} />
            <Detail
              label="Duration"
              value={
                apt.service.duration_minutes
                  ? `${apt.service.duration_minutes} min`
                  : "—"
              }
            />
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-0.5 ${status.color}`}
              >
                {status.icon} {status.label}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${payment.color}`}
              >
                <IndianRupee className="w-2.5 h-2.5" /> {payment.label}
              </span>
            </div>
          </div>

          {apt.notes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{apt.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {canComplete && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 gap-1.5"
              onClick={() => handleStatus("completed")}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Mark as Completed
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
              onClick={() => handleStatus("cancelled")}
              disabled={updating}
            >
              <XCircle className="w-4 h-4" /> Cancel Appointment
            </Button>
          )}
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScheduleTab() {
  const [appointments, setAppointments] = useState<GroupedAppointments>({
    today: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "confirmed" | "completed" | "cancelled"
  >("all");

  useEffect(() => {
    fetch("/api/dashboard/appointments")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAppointments(res.data);
        else setError(res.error ?? "Failed to load appointments");
      })
      .catch(() => setError("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) => ({
      today: prev.today.map((a) => (a.id === id ? { ...a, status } : a)),
      upcoming: prev.upcoming.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
  };

  const filterApts = (list: Appointment[]) =>
    activeFilter === "all"
      ? list
      : list.filter((a) => a.status === activeFilter);

  const todayFiltered = filterApts(appointments.today);
  const upcomingFiltered = filterApts(appointments.upcoming);
  const totalToday = appointments.today.length;
  const confirmedToday = appointments.today.filter(
    (a) => a.status === "confirmed",
  ).length;

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
    <div className="space-y-6">
      {/* Header + Stats */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Schedule</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {totalToday} appointment{totalToday !== 1 ? "s" : ""} today
            {confirmedToday > 0 && ` · ${confirmedToday} confirmed`}
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "confirmed", "completed", "cancelled"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                  activeFilter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {f}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Today */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Today</h3>
          <span className="text-xs text-gray-400">
            {format(new Date(), "EEEE, MMMM d")}
          </span>
          {appointments.today.length > 0 && (
            <Badge className="bg-blue-50 text-blue-700 border-none text-[10px]">
              {appointments.today.length}
            </Badge>
          )}
        </div>

        {todayFiltered.length === 0 ? (
          <EmptyState
            icon={<CalendarX className="w-8 h-8 text-gray-200" />}
            message={
              activeFilter !== "all"
                ? `No ${activeFilter} appointments today`
                : "No appointments scheduled for today"
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {todayFiltered.map((apt) => (
              <AppointmentCard
                key={apt.id}
                apt={apt}
                onClick={() => setSelectedApt(apt)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <h3 className="text-sm font-semibold text-gray-900">Upcoming</h3>
          <span className="text-xs text-gray-400">Next 7 days</span>
          {appointments.upcoming.length > 0 && (
            <Badge variant="outline" className="text-[10px]">
              {appointments.upcoming.length}
            </Badge>
          )}
        </div>

        {upcomingFiltered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="w-8 h-8 text-gray-200" />}
            message={
              activeFilter !== "all"
                ? `No ${activeFilter} upcoming appointments`
                : "No upcoming appointments"
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingFiltered.map((apt) => (
              <AppointmentCard
                key={apt.id}
                apt={apt}
                showDate
                onClick={() => setSelectedApt(apt)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Detail Dialog */}
      <AppointmentDialog
        apt={selectedApt}
        open={!!selectedApt}
        onClose={() => setSelectedApt(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
