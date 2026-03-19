type CalendarInvitePayload = {
  appointmentId: string;
  appointmentDate: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime?: string;
  durationMinutes?: number;
  doctorName: string;
  patientName: string;
  doctorEmail?: string;
  patientEmail?: string;
  meetingLink?: string;
  mode?: "video" | "chat";
  location?: string;
};

const DEFAULT_DURATION_MINUTES = 30;

// ✅ Convert to UTC ICS format: YYYYMMDDTHHmmssZ
function formatUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function parseTime(value: string): { hours: number; minutes: number } {
  const [h, m] = value.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    throw new Error(`Invalid time: ${value}`);
  }
  return { hours: h, minutes: m };
}

function parseAppointmentDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Invalid date: ${value}`);
  // ✅ UTC-based, no timezone shift
  return new Date(Date.UTC(y, m - 1, d));
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// ✅ Fix - skip folding for ORGANIZER and ATTENDEE lines
function foldLine(line: string): string {
  if (line.includes("MAILTO:")) return line;
  return line.length <= 75 ? line : line.match(/.{1,73}/g)!.join("\r\n ");
}

export function generateAppointmentIcs(payload: CalendarInvitePayload): string {
  const appointmentDay = parseAppointmentDate(payload.appointmentDate);
  const { hours, minutes } = parseTime(payload.time);

  console.log("hours", hours);
  console.log("minutes", minutes);

  // ✅ Use Date.UTC to avoid timezone issues on server
const start = new Date(Date.UTC(
  appointmentDay.getFullYear(),
  appointmentDay.getMonth(),
  appointmentDay.getDate(),
  hours,
  minutes,
));



  let end: Date;

  if (payload.endTime) {
    const { hours: eh, minutes: em } = parseTime(payload.endTime);
    // Same for end
 end = new Date(Date.UTC(
  appointmentDay.getFullYear(),
  appointmentDay.getMonth(),
  appointmentDay.getDate(),
  eh,
  em,
));
  } else {
    const duration = payload.durationMinutes ?? DEFAULT_DURATION_MINUTES;
    end = new Date(start.getTime() + duration * 60000);
  }

  const meetingText = payload.meetingLink
    ? `Join link: ${payload.meetingLink}`
    : "";

  const modeText =
    payload.mode === "chat" ? "Chat Consultation" : "Video Consultation";

  const location = payload.location || payload.meetingLink || "Health UPI";

  const rawDescription = [modeText, meetingText].filter(Boolean).join("\n");
  const description = escapeIcsText(rawDescription);
//const description = `${modeText}${meetingText ? `\\n${meetingText}` : ""}`;

  const organizerEmail ="contact@healthbase.app";
  const attendeeEmail = payload.patientEmail || "contact@healthbase.app";

  const uid = `${payload.appointmentId}@healthbase.app`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Health UPI//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escapeIcsText(`Consultation with ${payload.doctorName}`)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${escapeIcsText(location)}`,
    `ORGANIZER;CN="${escapeIcsText(`${payload.doctorName}`)}":MAILTO:${organizerEmail}`,
    `ATTENDEE;CN="${escapeIcsText(payload.patientName)}";RSVP=TRUE;PARTSTAT=NEEDS-ACTION:MAILTO:${attendeeEmail}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
