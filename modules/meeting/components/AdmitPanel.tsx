"use client";

import { useMeeting } from "@videosdk.live/react-sdk";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AdmitRequest = {
  participantId: string;
  timestamp: number;
};

export default function AdmitPanel() {
  const { meeting } = useMeeting();
  const [requests, setRequests] = useState<AdmitRequest[]>([]);

  const handleEntryRequest = (participantId: string) => {
    setRequests((prev) => {
      // Avoid duplicates
      if (prev.some((r) => r.participantId === participantId)) {
        return prev;
      }
      return [...prev, { participantId, timestamp: Date.now() }];
    });
  };

  useEffect(() => {
    if (!meeting) return;

    meeting?.on("entry-requested", handleEntryRequest);

    return () => {
      meeting?.off("entry-requested", handleEntryRequest);
    };
  }, [meeting]);

  if (!requests.length) return null;

  return (
    <Card className="absolute top-4 right-4 p-4 w-72 space-y-3 bg-gray-800 border-gray-700">
      <h4 className="font-semibold text-white">
        Waiting Patients ({requests.length})
      </h4>

      {requests.map(({ participantId }) => (
        <div
          key={participantId}
          className="flex justify-between items-center bg-gray-700 p-2 rounded"
        >
          <span className="text-sm text-gray-200">Patient #{participantId.slice(0, 4)}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                meeting?.respondEntry(participantId, true);
                setRequests((prev) =>
                  prev.filter((r) => r.participantId !== participantId)
                );
              }}
            >
              Admit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                meeting?.respondEntry(participantId, false);
                setRequests((prev) =>
                  prev.filter((r) => r.participantId !== participantId)
                );
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
}