"use client";

import { useMeeting } from "@videosdk.live/react-sdk";
import ParticipantTile from "./ParticipantTile";
import LocalParticipantTile from "./LocalParticipantTile";

export default function VideoSection() {
  const { participants, localParticipant } = useMeeting();

  // Filter out the local participant to avoid duplicate tiles
  const remoteParticipants = [...participants.values()].filter(
    (p: any) => p.id !== localParticipant?.id
  );

  const totalTiles = 1 + remoteParticipants.length; // 1 for local

  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-900 p-2">
      <div
        className="grid gap-2 w-full h-full"
        style={{
          gridTemplateColumns:
            totalTiles === 1
              ? "1fr"
              : totalTiles === 2
                ? "1fr 1fr"
                : "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        {localParticipant && (
          <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden">
            <LocalParticipantTile />
          </div>
        )}
        {remoteParticipants.map((participant: any) => (
          <div
            key={participant.id}
            className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden"
          >
            <ParticipantTile participantId={participant.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
