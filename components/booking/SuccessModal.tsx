"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Copy,
  Calendar,
  Clock,
  User,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { sendEmailRequest } from "@/lib/email/send-email-request";
import { useEffect, useRef } from "react";

interface SuccessModalProps {
  doctorName: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  fee: number;
  confirmationNumber: string;
  appointmentId: string;
  patientName: string;
  doctorEmail: string;
  patientEmail: string;
  onClose: () => void;
  location: string;
  meetingLink?: string | null;
}

export default function SuccessModal({
  doctorName,
  serviceName,
  appointmentDate,
  startTime,
  endTime,
  duration,
  fee,
  confirmationNumber,
  appointmentId,
  patientName,
  doctorEmail,
  patientEmail,
  meetingLink,
  location,
  onClose,
}: SuccessModalProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(confirmationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasSentEmail = useRef(false);

  useEffect(() => {
    if (hasSentEmail.current) return; // ✅ prevent multiple runs
    hasSentEmail.current = true;

    const sendEmails = async () => {
      try {
        const formattedDate = format(
          new Date(appointmentDate),
          "EEEE, MMM d, yyyy",
        );

        const emailPayload = {
          doctorName,
          specialization: "",
          date: formattedDate,
          time: startTime,
          endTime: endTime,
          appointmentDate,
          durationMinutes: duration,
          mode: serviceName,
          meetingLink,
          appointmentId,
          location,
        };

        await Promise.all([
          sendEmailRequest("sendPatientConsultationEmail", {
            ...emailPayload,
            patientEmail,
            patientName,
          }),
          sendEmailRequest("sendDoctorAppointmentEmail", {
            ...emailPayload,
            doctorEmail,
            patientName,
          }),
        ]);
      } catch (error) {
        console.error("Email sending failed:", error);
      }
    };

    sendEmails();
  }, []); // ✅ runs only once on mount

  return (
    <Card className="p-6 sm:p-8 mb-8 border-success/30 bg-success/5">
      {/* Success Icon */}
      <div className="flex justify-center mb-8">
        <div className="bg-success/20 border border-success/50 rounded-full p-4">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Appointment Confirmed!
        </h2>
        <p className="text-foreground/70 mb-4">
          Your appointment has been successfully booked. A confirmation email
          has been sent to you.
        </p>

        {/* Confirmation Number */}
        <div className="inline-flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">
              Confirmation Number
            </p>
            <p className="font-mono font-bold text-primary text-lg">
              {confirmationNumber}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-primary/20 rounded-lg transition"
            title="Copy confirmation number"
          >
            <Copy
              className={`w-4 h-4 ${copied ? "text-success" : "text-primary"}`}
            />
          </button>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-4 rounded-lg bg-secondary/30 border border-secondary/50">
        {/* Doctor */}
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">
              Doctor
            </p>
            <p className="font-semibold text-foreground">Dr. {doctorName}</p>
          </div>
        </div>

        {/* Service */}
        <div className="flex items-start gap-3">
          <Badge className="bg-primary text-primary-foreground mt-0.5">
            {serviceName}
          </Badge>
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">
              Service
            </p>
            <p className="font-semibold text-foreground">{serviceName}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">
              Date
            </p>
            <p className="font-semibold text-foreground">
              {format(new Date(appointmentDate), "EEEE, MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">
              Time
            </p>
            <p className="font-semibold text-foreground">
              {startTime} – {endTime} ({duration} mins)
            </p>
          </div>
        </div>

        {/* Patient Name */}
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">
              Patient Name
            </p>
            <p className="font-semibold text-foreground">{patientName}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground/60 uppercase mb-1">
              Amount Paid
            </p>
            <p className="font-semibold text-foreground">₹{fee}</p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="p-4 rounded-lg bg-info/10 border border-info/20 mb-8">
        <h3 className="font-semibold text-foreground mb-3 text-sm">
          What's next?
        </h3>
        <ul className="space-y-2 text-sm text-foreground/70">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">1.</span>
            <span>
              A confirmation email with appointment details has been sent to
              your email
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">2.</span>
            <span>
              Please reach the clinic 10 minutes before your appointment time
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">3.</span>
            <span>
              You can reschedule or cancel up to 24 hours before the appointment
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">4.</span>
            <span>
              For any questions, contact us or reach out to the clinic directly
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onClose}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
        >
          Back to Home
        </Button>
        <Button
          variant="outline"
          className="flex-1 py-6"
          onClick={() => {
            // Could navigate to appointments page
            window.location.href = "/patient/appointments";
          }}
        >
          View My Appointments
        </Button>
      </div>

      {/* Contact Info */}
      <p className="text-xs text-foreground/50 mt-6 text-center">
        Appointment ID: {appointmentId}
      </p>
    </Card>
  );
}
