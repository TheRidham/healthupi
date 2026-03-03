"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import WaitingScreen from "./WaitingScreen";
import { toast } from "sonner";

const VideoSDKMeetingProvider = dynamic(
  () => import("./VideoSDKMeetingProvider"),
  { ssr: false }
);

type Props = {
  appointmentId: string;
  meetingId: string;
  role: "doctor" | "patient";
  name: string;
};

type MeetingState = {
  token: string | null;
  roomId: string | null;
  error: string | null;
};

export default function MeetingProvider({
  appointmentId,
  meetingId,
  role,
  name,
}: Props) {
  const [state, setState] = useState<MeetingState>({
    token: null,
    roomId: null,
    error: null,
  });
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization from React re-renders
    if (initRef.current) return;
    initRef.current = true;

    async function initializeMeeting() {
      try {
        // Step 1: Create or get VideoSDK room for this appointment
        const roomRes = await fetch("/api/meeting/room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId }),
        });

        if (!roomRes.ok) {
          throw new Error("Failed to create meeting room");
        }

        const roomData = await roomRes.json();
        const roomId = roomData.roomId;

        // Step 2: Get token
        const tokenRes = await fetch("/api/meeting/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, role }),
        });

        if (!tokenRes.ok) {
          throw new Error("Failed to fetch meeting token");
        }

        const tokenData = await tokenRes.json();

        if (!tokenData.token) {
          throw new Error("Token response is empty: " + JSON.stringify(tokenData));
        }

        setState({
          token: tokenData.token,
          roomId,
          error: null,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error("Meeting initialization error:", err);
        setState({ token: null, roomId: null, error: errorMsg });
        toast.error("Failed to initialize meeting: " + errorMsg);
      }
    }

    initializeMeeting();
  }, [appointmentId, role]);

  if (state.error) {
    return <WaitingScreen title={`Error: ${state.error}`} />;
  }

  if (!state.token || !state.roomId) {
    return <WaitingScreen title="Preparing secure consultation..." />;
  }

  return (
    <VideoSDKMeetingProvider
      token={state.token}
      meetingId={state.roomId}
      role={role}
      name={name}
    />
  );
}
