import type { DoctorData, SimpleSlot, ServiceOption } from "@/types/doctor-profile";

// ── Fallback Doctor Data ──────────────────────────────────────────
export const FALLBACK_DOCTOR: Omit<DoctorData, "id" | "user_id" | "experience_years"> = {
  name: "Dr. Rahul Sharma",
  title: "Senior Consultant",
  specialization: "Internal Medicine",
  subSpecialization: "Cardiology",
  experience: "15 years",
  qualifications: ["MD", "MBBS", "FACC", "Board Certified"],
  registrationNumber: "MCI-2011-48293",
  clinicName: "Sharma Cardiology Center",
  hospital: "Apollo Hospital",
  address: "1234 Medical Plaza, Suite 200, Connaught Place, New Delhi, Delhi 110001",
  phone: "+91 98765 43210",
  website: "www.sharmaCardiology.com",
  rating: 4.9,
  reviewCount: 842,
  patientsServed: "3,200+",
  bio: "Experienced cardiologist with over 15 years of practice in interventional cardiology and preventive heart care. Passionate about leveraging telemedicine to improve patient access to quality healthcare.",
  languages: ["English", "Hindi", "Tamil"],
  avatar: "/images/doctor-avatar.jpg",
  galleryImages: [
    { src: "/images/clinic-1.jpg", alt: "Examination room" },
    { src: "/images/clinic-2.jpg", alt: "Reception area" },
    { src: "/images/clinic-3.jpg", alt: "Consultation office" },
  ],
};

// ── Mock Time Slots (UI demo fallback) ───────────────────────────
export const TIME_SLOTS_28_FEB: SimpleSlot[] = [
  { time: "9:00 AM",  endTime: "9:30 AM",  duration: 30, available: true  },
  { time: "9:30 AM",  endTime: "10:00 AM", duration: 30, available: true  },
  { time: "10:00 AM", endTime: "10:30 AM", duration: 30, available: false },
  { time: "10:30 AM", endTime: "11:00 AM", duration: 30, available: false },
  { time: "11:00 AM", endTime: "11:30 AM", duration: 30, available: true  },
  { time: "11:30 AM", endTime: "12:00 PM", duration: 30, available: true  },
  { time: "2:00 PM",  endTime: "2:30 PM",  duration: 30, available: false },
  { time: "2:30 PM",  endTime: "3:00 PM",  duration: 30, available: true  },
  { time: "3:00 PM",  endTime: "3:30 PM",  duration: 30, available: true  },
  { time: "3:30 PM",  endTime: "4:00 PM",  duration: 30, available: true  },
  { time: "4:00 PM",  endTime: "4:30 PM",  duration: 30, available: true  },
];

export const TIME_SLOTS_1_MAR: SimpleSlot[] = [
  { time: "10:00 AM", endTime: "10:30 AM", duration: 30, available: true  },
  { time: "10:30 AM", endTime: "11:00 AM", duration: 30, available: true  },
  { time: "11:00 AM", endTime: "11:30 AM", duration: 30, available: false },
  { time: "2:00 PM",  endTime: "2:30 PM",  duration: 30, available: true  },
  { time: "2:30 PM",  endTime: "3:00 PM",  duration: 30, available: true  },
];

export const TIME_SLOTS_OTHER: SimpleSlot[] = [
  { time: "9:00 AM",  endTime: "9:30 AM",  duration: 30, available: true },
  { time: "9:30 AM",  endTime: "10:00 AM", duration: 30, available: true },
  { time: "10:00 AM", endTime: "10:30 AM", duration: 30, available: true },
  { time: "10:30 AM", endTime: "11:00 AM", duration: 30, available: true },
  { time: "11:00 AM", endTime: "11:30 AM", duration: 30, available: true },
  { time: "11:30 AM", endTime: "12:00 PM", duration: 30, available: true },
  { time: "2:00 PM",  endTime: "2:30 PM",  duration: 30, available: true },
  { time: "2:30 PM",  endTime: "3:00 PM",  duration: 30, available: true },
  { time: "3:00 PM",  endTime: "3:30 PM",  duration: 30, available: true },
  { time: "3:30 PM",  endTime: "4:00 PM",  duration: 30, available: true },
];

// ── Fallback Services ─────────────────────────────────────────────
// NOTE: Icons are kept here as a reference map used at runtime.
// Do NOT import JSX here from a server module; icons are resolved in helpers.
export const FALLBACK_SERVICE_LIST: Omit<ServiceOption, "icon">[] = [
  { id: "video-call",   type: "service",  name: "Video Call",    price: 500,  enabled: true, description: "One-on-one video consultation"           },
  { id: "chat",         type: "service",  name: "Chat",          price: 200,  enabled: true, description: "Text-based consultation"                 },
  { id: "home-visit",   type: "service",  name: "Home Visit",    price: 1500, enabled: true, description: "In-person visit at your residence"       },
  { id: "emergency",    type: "service",  name: "Emergency",     price: 2000, enabled: true, description: "Urgent consultations (priority)"         },
  { id: "subscription", type: "service",  name: "Subscription",  price: 3000, enabled: true, description: "Monthly unlimited consultations"         },
  { id: "followup",     type: "followup", name: "Follow-up",     price: -1,   enabled: true, description: "Follow-up for returning patients (reduced rates)" },
];