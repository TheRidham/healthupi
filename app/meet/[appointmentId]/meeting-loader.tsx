"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MeetingProvider from "@/modules/meeting/components/MeetingProvider";
import WaitingScreen from "@/modules/meeting/components/WaitingScreen";
import { toast } from "sonner";

type Props = {
  appointmentId: string;
};

export default function MeetingLoader({ appointmentId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingData, setMeetingData] = useState<{
    meetingId: string;
    role: "doctor" | "patient";
    name: string;
  } | null>(null);

  useEffect(() => {
    async function validateAndLoad() {
      try {
        // Get current user from Supabase
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("Please login first to join the meeting");
          setLoading(false);
          return;
        }

        // For development: use fake DB if real auth fails
        const isDevMode = process.env.NODE_ENV === "development";
        const userId = user.id;

        // Validate meeting and get details
        const res = await fetch("/api/meeting/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId,
            userId: isDevMode ? userId : undefined,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to validate meeting");
        }

        const data = await res.json();
        setMeetingData(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to load meeting:", err);
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    validateAndLoad();
  }, [appointmentId]);

  if (loading) {
    return <WaitingScreen title="Loading meeting details..." />;
  }

  if (error) {
    return <WaitingScreen title={`Error: ${error}`} />;
  }

  if (!meetingData) {
    return <WaitingScreen title="Failed to load meeting" />;
  }

  return (
    <MeetingProvider
      appointmentId={appointmentId}
      meetingId={meetingData.meetingId}
      role={meetingData.role}
      name={meetingData.name}
    />
  );
}
