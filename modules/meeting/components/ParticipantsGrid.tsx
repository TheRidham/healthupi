import { useMeeting } from "@videosdk.live/react-sdk";
import ParticipantTile from "./ParticipantTile";

export default function ParticipantsGrid() {
  const { participants } = useMeeting();

  if (!participants || participants.size === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No other participants
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 overflow-auto">
      {[...participants.values()].map((participant: any) => (
        <div
          key={participant.id}
          className="aspect-video bg-gray-800 rounded-lg overflow-hidden"
        >
          <ParticipantTile participantId={participant.id} />
        </div>
      ))}
    </div>
  );
}