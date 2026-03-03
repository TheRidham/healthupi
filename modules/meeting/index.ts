// Meeting Module Index - Export all public APIs

// Types
export { type UserRole, type MeetingStatus, type ValidateMeetingResponse } from "./types/meeting.types";

// Services
export { validateMeeting } from "./services/meeting.service";
export { generateVideoSdkToken } from "./services/token.service";

// Utils & Config
export { VIDEOSDK_CONFIG, MEETING_STATES, PARTICIPANT_ROLES, getParticipantRole, formatParticipantName } from "./utils/meeting.config";

// Hooks
export { useMeetingState, useParticipantAudio, useParticipantVideo } from "./hooks/useMeetingState";
