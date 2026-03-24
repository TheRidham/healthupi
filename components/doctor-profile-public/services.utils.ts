import { Phone, Clock, Award, BookOpen, Video, LucideIcon } from "lucide-react";

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  fee?: number;
  iconType: string;
  selected: boolean;
}

export interface DoctorService {
  id: string;
  doctor_id: string;
  service_id: string;
  price?: number;
  services?: {
    id: string;
    name: string;
    description: string;
    duration: number;
  };
}

export const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  consultation: Phone,
  "follow-up": Clock,
  diagnosis: Award,
  "treatment-plan": BookOpen,
  "online-consultation": Video,
};

export const getServiceIcon = (serviceId: string): LucideIcon => {
  return SERVICE_ICON_MAP[serviceId] || Phone;
};

export const PREDEFINED_SERVICES: Service[] = [
  {
    id: "consultation",
    name: "General Consultation",
    description: "Initial consultation and medical advice",
    duration: 30,
    iconType: "consultation",
    selected: false,
  },
  {
    id: "follow-up",
    name: "Follow-up Consultation",
    description: "Follow-up appointment for ongoing treatment",
    duration: 20,
    iconType: "follow-up",
    selected: false,
  },
  {
    id: "diagnosis",
    name: "Diagnostic Evaluation",
    description: "Comprehensive diagnosis and assessment",
    duration: 45,
    iconType: "diagnosis",
    selected: false,
  },
  {
    id: "treatment-plan",
    name: "Treatment Planning",
    description: "Detailed treatment plan customization",
    duration: 40,
    iconType: "treatment-plan",
    selected: false,
  },
  {
    id: "online-consultation",
    name: "Online Video Consultation",
    description: "Virtual consultation via video call",
    duration: 30,
    iconType: "online-consultation",
    selected: false,
  },
];
