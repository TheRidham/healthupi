import { useCallback, useMemo } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { getParticipantRole } from "../utils/meeting.config";

export function useMeetingState() {
  const { meeting, participants, localParticipant } =
    useMeeting();
  const { micOn, webcamOn } = useParticipant(localParticipant?.id || "");

  const doctorPresent = useMemo(() => {
    if (!participants) return false;
    return [...participants.values()].some((p: any) => {
      try {
        return getParticipantRole(p.metaData) === "doctor";
      } catch {
        return false;
      }
    });
  }, [participants]);

  const patientCount = useMemo(() => {
    if (!participants) return 0;
    return [...participants.values()].filter((p: any) => {
      const role = getParticipantRole(p.metaData);
      return role === "patient";
    }).length;
  }, [participants]);

  const participantList = useMemo(() => {
    return [...(participants?.values() || [])];
  }, [participants]);

  const isDoctorMuted = useMemo(() => {
    return !micOn;
  }, [micOn]);

  const isDoctorCameraOff = useMemo(() => {
    return !webcamOn;
  }, [webcamOn]);

  const getParticipantById = useCallback(
    (id: string) => {
      return [...(participants?.values() || [])].find((p) => p.id === id);
    },
    [participants]
  );

  return {
    meeting,
    participants: participantList,
    localParticipant,
    doctorPresent,
    patientCount,
    isDoctorMuted,
    isDoctorCameraOff,
    getParticipantById,
    micOn,
    webcamOn,
  };
}

export function useParticipantAudio(participantId: string) {
  const { participant } = useParticipant(participantId);

  const isAudioOn = useMemo(() => {
    if (participant?.streams) {
      const audioStream = (participant.streams.get("audio") as any) as MediaStream;
      return audioStream ? audioStream.getAudioTracks().length > 0 : false;
    }
    return false;
  }, [participant?.streams]);

  return { isAudioOn, participant };
}

export function useParticipantVideo(participantId: string) {
  const { participant } = useParticipant(participantId);

  const isVideoOn = useMemo(() => {
    if (participant?.streams) {
      const videoStream = (participant.streams.get("video") as any) as MediaStream;
      return videoStream ? videoStream.getVideoTracks().length > 0 : false;
    }
    return false;
  }, [participant?.streams]);

  const videoStream = useMemo(() => {
    if (participant?.streams && isVideoOn) {
      const video = (participant.streams.get("video") as any) as MediaStream;
      return video ? new MediaStream(video.getVideoTracks()) : null;
    }
    return null;
  }, [participant?.streams, isVideoOn]);

  return { isVideoOn, videoStream, participant };
}
