"use client";

import { useEffect, useRef } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { Mic } from "lucide-react";

type Props = {
  participantId: string;
};

export default function ParticipantTile({ participantId }: Props) {
  const { webcamStream, micStream, webcamOn, micOn, displayName, isLocal } =
    useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(console.error);
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micOn && micStream && audioRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);
      audioRef.current.srcObject = mediaStream;
      audioRef.current.play().catch(console.error);
    } else if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
  }, [micStream, micOn]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      {webcamOn ? (
        <video
          autoPlay
          muted={isLocal}
          ref={videoRef}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-white text-2xl font-bold">
            {(displayName || "Guest").charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <audio autoPlay muted={isLocal} ref={audioRef} className="hidden" />

      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <div className="bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs font-medium">
          {displayName || "Guest"}
        </div>
        {!micOn && (
          <div className="bg-red-500 p-1.5 rounded-full">
            <Mic size={12} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
