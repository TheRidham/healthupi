export const VIDEOSDK_CONFIG = {
  MAX_PARTICIPANTS: 100,
  AUDIO_CODEC: "opus",
  VIDEO_CODEC: "vp8",
  SCREEN_SHARE_CODEC: "vp8",
};

export const MEETING_STATES = {
  IDLE: "IDLE",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  FAILED: "FAILED",
  CLOSED: "CLOSED",
} as const;

export const PARTICIPANT_ROLES = {
  DOCTOR: "doctor",
  PATIENT: "patient",
} as const;

export function getParticipantRole(metaData: string): string {
  try {
    const parsed = JSON.parse(metaData || "{}");
    return parsed.role || PARTICIPANT_ROLES.PATIENT;
  } catch {
    return PARTICIPANT_ROLES.PATIENT;
  }
}

export function formatParticipantName(name: string, role: string): string {
  return role === PARTICIPANT_ROLES.DOCTOR ? `Dr. ${name}` : name;
}
