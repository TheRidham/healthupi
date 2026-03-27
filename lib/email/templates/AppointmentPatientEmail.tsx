import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Button,
  Section,
} from "@react-email/components";

interface AppointmentPatientEmailProps {
  patientName: string;
  doctorName: string;
  specialization?: string;
  date: string;
  time: string;
  mode: "video" | "chat";
  meetingLink: string;
  appointmentId: string;
}

export default function AppointmentPatientEmail({
  patientName,
  doctorName,
  specialization,
  date,
  time,
  mode,
  meetingLink,
  appointmentId,
}: AppointmentPatientEmailProps) {
  return (
    <Html>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Appointment Confirmed 🩺</Heading>

          <Text style={styles.text}>Hello {patientName},</Text>

          <Text style={styles.text}>
            Your appointment with <strong>Dr. {doctorName}</strong>
            {specialization ? ` (${specialization})` : ""} has been successfully
            scheduled.
          </Text>

          <Section style={styles.detailsBox}>
            <Text style={styles.detailItem}>
              <strong>Appointment ID:</strong> {appointmentId}
            </Text>
            <Text style={styles.detailItem}>
              <strong>Date:</strong> {date}
            </Text>
            <Text style={styles.detailItem}>
              <strong>Time:</strong> {time}
            </Text>
            <Text style={styles.detailItem}>
              <strong>Mode:</strong>{" "}
              {mode === "video" ? "Video Appointment" : "Chat Appointment"}
            </Text>
          </Section>

          <Button href={meetingLink} style={styles.button}>
            {mode === "video"
              ? "Join Video Appointment"
              : "Start Chat Appointment"}
          </Button>

          <Text style={styles.note}>
            Please join 5 minutes before your scheduled time.
          </Text>

          <Text style={styles.footer}>
            If you need to reschedule or cancel your appointment, please contact
            our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f4f6f8",
    padding: "40px 0",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "8px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "20px",
  },
  text: {
    fontSize: "16px",
    color: "#374151",
    marginBottom: "15px",
  },
  detailsBox: {
    backgroundColor: "#f9fafb",
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px",
  },
  detailItem: {
    fontSize: "14px",
    color: "#111827",
    marginBottom: "8px",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "bold",
    textAlign: "center" as const,
  },
  note: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "20px",
  },
  footer: {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "30px",
  },
};
