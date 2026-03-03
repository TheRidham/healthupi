"use client";

import {
  MeetingProvider as VideoSDKProvider,
} from "@videosdk.live/react-sdk";
import MeetingContainer from "./MeetingContainer";
import { useEffect } from "react";

type Props = {
  token: string;
  meetingId: string;
  role: "doctor" | "patient";
  name: string;
};

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress VideoSDK internal queue errors
      if (
        event.reason?.message?.includes("AwaitQueueStoppedError") ||
        event.reason?.toString?.().includes("AwaitQueueStoppedError")
      ) {
        event.preventDefault();
        console.debug("VideoSDK queue cleanup - suppressed", event.reason);
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}

export default function VideoSDKMeetingProvider({
  token,
  meetingId,
  role,
  name,
}: Props) {
  return (
    <VideoSDKProvider
      config={{
        meetingId,
        name,
        micEnabled: role === "doctor",
        webcamEnabled: role === "doctor",
        debugMode: false,
      } as any}
      token={token}
      joinWithoutUserInteraction={true}
    >
      <ErrorBoundary>
        <MeetingContainer role={role} />
      </ErrorBoundary>
    </VideoSDKProvider>
  );
}
