"use client";

import { useCallback } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ControlsBar({
  role,
}: {
  role: "doctor" | "patient";
}) {
  const router = useRouter();
  const {
    leave,
    toggleWebcam,
    toggleMic,
    localWebcamOn,
    localMicOn,
  } = useMeeting();

  const handleEndMeeting = useCallback(async () => {
    try {
      await leave();
    } catch (err) {
      console.error("Error leaving meeting:", err);
    }
    toast.success("Meeting ended");
    router.push("/dashboard");
  }, [leave, router]);

  return (
    <div className="bg-gray-900 border-t border-gray-700 px-6 py-4 flex items-center justify-center gap-3">
      <Button
        variant={localMicOn ? "default" : "destructive"}
        size="lg"
        className="rounded-full w-12 h-12 p-0"
        onClick={() => toggleMic()}
        title={localMicOn ? "Mute" : "Unmute"}
      >
        {localMicOn ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </Button>

      <Button
        variant={localWebcamOn ? "default" : "destructive"}
        size="lg"
        className="rounded-full w-12 h-12 p-0"
        onClick={() => toggleWebcam()}
        title={localWebcamOn ? "Turn off camera" : "Turn on camera"}
      >
        {localWebcamOn ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </Button>

      <Button
        variant="destructive"
        size="lg"
        className="rounded-full w-12 h-12 p-0"
        onClick={handleEndMeeting}
        title="End meeting"
      >
        <Phone className="w-5 h-5 rotate-[135deg]" />
      </Button>
    </div>
  );
}
