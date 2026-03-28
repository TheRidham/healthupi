"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseISO } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrCreateConversationForAppointment } from "@/services/chat.service";
import { toast } from "sonner";

// ─── Helper Functions ─────────────────────────────────────────────────────────

function isAppointmentTimeArrived(appointmentDate: string, startTime: string): boolean {
  const [hours, minutes] = startTime.split(":").map(Number);
  const appointmentDateTime = parseISO(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  return now >= appointmentDateTime;
}

function getAppointmentDateTime(appointmentDate: string, startTime: string): Date {
  const [hours, minutes] = startTime.split(":").map(Number);
  const appointmentDateTime = parseISO(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  return appointmentDateTime;
}

type Appointment = {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number | null;
  service_name: string | null;
  status: "confirmed" | "completed" | "cancelled" | "pending";
  consultation_type: "online" | "offline";
  doctor: {
    first_name: string;
    last_name: string;
    clinic_name: string;
    phone: string;
  };
};

export default function AppointmentsTab() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/patient/appointments`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAppointments(res.data || []);
        else setError(res.error ?? "Failed to load appointments");
      })
      .catch(() => setError("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  const getStatusColor = (
    status: "confirmed" | "completed" | "cancelled" | "pending"
  ) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 border-green-200 text-green-900";
      case "completed":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "cancelled":
        return "bg-red-50 border-red-200 text-red-900";
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  const getStatusIcon = (
    status: "confirmed" | "completed" | "cancelled" | "pending"
  ) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (
    status: "confirmed" | "completed" | "cancelled" | "pending"
  ) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isUpcoming = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    return appointmentDate > new Date();
  };

  const upcomingAppointments = appointments.filter((apt) =>
    isUpcoming(apt.appointment_date)
  );
  const pastAppointments = appointments.filter(
    (apt) => !isUpcoming(apt.appointment_date)
  );

  return (
    <div className="space-y-8">
      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Appointments
        </h2>

        {upcomingAppointments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Past Appointments
          </h2>
          <div className="space-y-3">
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const router = useRouter();
  const [chatLoading, setChatLoading] = useState(false);
  
  const appointmentDate = new Date(appointment.appointment_date);
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isUpcoming = new Date(appointment.appointment_date) > new Date();
  const isChatConsultation = appointment.service_name?.toLowerCase().includes('chat');

  const handleStartChat = async () => {
    try {
      // Check if appointment time has arrived
      if (!isAppointmentTimeArrived(appointment.appointment_date, appointment.appointment_time)) {
        const appointmentTime = getAppointmentDateTime(
          appointment.appointment_date,
          appointment.appointment_time
        );
        toast(
          `Chat will be available from ${appointmentTime.toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          )}`
        );
        return;
      }

      setChatLoading(true);

      const conversationId = await getOrCreateConversationForAppointment({
        appointmentId: appointment.id,
      });

      router.push(`/chat/${conversationId}`);
    } catch (err) {
      console.error("Error starting chat:", err);
      toast("Failed to start chat. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  const getStatusColor = (
    status: "confirmed" | "completed" | "cancelled" | "pending"
  ) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 border-green-200";
      case "completed":
        return "bg-blue-50 border-blue-200";
      case "cancelled":
        return "bg-red-50 border-red-200";
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadgeVariant = (
    status: "confirmed" | "completed" | "cancelled" | "pending"
  ) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div
      className={`border border-gray-200 rounded-lg p-5 transition-colors hover:bg-gray-50 ${getStatusColor(appointment.status)}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">
            Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
          </h3>
          <p className="text-sm text-gray-600">
            {appointment.doctor.clinic_name}
          </p>
        </div>
        <Badge
          variant={getStatusBadgeVariant(appointment.status)}
          className="capitalize"
        >
          {appointment.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 flex-shrink-0 text-gray-500" />
          {formattedDate}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock className="w-4 h-4 flex-shrink-0 text-gray-500" />
          {appointment.appointment_time}
          {appointment.duration && ` (${appointment.duration} min)`}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MapPin className="w-4 h-4 flex-shrink-0 text-gray-500" />
          {isChatConsultation ? "Chat Consultation" : appointment.consultation_type === "online" ? "Online" : "In-Clinic"}
        </div>
        {appointment.doctor.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="w-4 h-4 flex-shrink-0 text-gray-500" />
            {appointment.doctor.phone}
          </div>
        )}
      </div>

      {appointment.service_name && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Service:</span> {appointment.service_name}
          </p>
        </div>
      )}

      {isUpcoming && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {appointment.status === "confirmed" && isChatConsultation && (
            <Button
              onClick={handleStartChat}
              disabled={chatLoading}
              className="gap-2 flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {chatLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              Start Chat
            </Button>
          )}
          {appointment.status === "confirmed" && !isChatConsultation && (
            <Button variant="outline" size="sm" className="gap-2 flex-1">
              Cancel
            </Button>
          )}
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
