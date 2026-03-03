"use client";

import { useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import MeetingLayout from "./MeetingLayout";
import WaitingScreen from "./WaitingScreen";

export default function MeetingContainer({
  role,
}: {
  role: "doctor" | "patient";
}) {
  const [joined, setJoined] = useState(false);

  useMeeting({
    onMeetingJoined: () => {
      setJoined(true);
    },
    onMeetingLeft: () => {
      setJoined(false);
    },
  });

  if (!joined) {
    return <WaitingScreen title="Connecting to consultation..." />;
  }

  return <MeetingLayout role={role} />;
}