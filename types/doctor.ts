export interface DoctorProfile {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
  specialization: string;
  sub_specialization: string;
  experience_years: number;
  rating: number;
  patients_served: number;
  photo_url: string;
  clinic_name: string;
  city: string;
  state: string;
  availability: string;
  about: string;
  qualifications: string[];
  languages: string[];
  phone: string;
  email: string;
  website: string;
  google_meet_link: string;
  hospital: string;
  address: string;
  clinic_photo_urls: string[];
}