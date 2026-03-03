export type UserRole = "doctor" | "patient";

export type MeetingStatus =
  | "idle"
  | "validating"
  | "fetching-token"
  | "joining"
  | "waiting-for-host"
  | "waiting-for-admission"
  | "in-meeting"
  | "ended";

export interface ValidateMeetingResponse {
  meetingId: string;
  role: UserRole;
  name: string;
}