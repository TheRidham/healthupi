import { supabase } from "./supabase"

// ── Types ────────────────────────────────────────────────────
export interface DoctorFormData {
  //Step 0 — Basic Info
  photo: File | null
  title: string
  firstName: string
  lastName: string
  designation: string
  about: string

  //Step 1 — Professional
  specialization: string
  subSpecialization: string
  experience: string
  qualifications: string[]
  registrationNo: string

  //Step 2 — Clinic (+ photos NEW)
  clinicName: string
  hospital: string
  address: string
  city: string
  state: string
  zip: string
  clinicPhotos: File[]      // ← NEW

  //Step 3 — Contact (email moved to Step 0)
  phone: string
  website: string
  languages: string[]

  //Step 4 — Additional
  baseFee: string
  availability: string
  memberSince: string
  patientsServed: string
  rating: string

  //Step 5 — Account (NEW)
  email: string
  password: string
  confirmPassword: string
}

export const defaultFormData: DoctorFormData = {
  email: "",
  password: "",
  confirmPassword: "",
  photo: null,
  title: "Dr.",
  firstName: "",
  lastName: "",
  designation: "",
  about: "",
  specialization: "",
  subSpecialization: "",
  experience: "",
  qualifications: [],
  registrationNo: "",
  clinicName: "",
  hospital: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  clinicPhotos: [],
  phone: "",
  website: "",
  languages: [],
  baseFee: "",
  availability: "offline",
  memberSince: "",
  patientsServed: "",
  rating: "",
}

// ── Step 1: Sign Up with email + password ────────────────────
// Call this BEFORE showing the OTP screen
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Supabase will send a 6-digit OTP to the email
      emailRedirectTo: undefined,
    },
  })
  if (error) throw error
  return data
}


// ── Submit full doctor profile ───────────────────────────────
export async function submitDoctorProfile(form: DoctorFormData, userId: string) {
  
  // 1. Upload avatar
  let photoUrl: string | null = null
  if (form.photo) {
    const ext  = form.photo.name.split(".").pop()
    const path = `${userId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from("doctor-photos")
      .upload(path, form.photo)
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from("doctor-photos").getPublicUrl(path)
    photoUrl = urlData.publicUrl
  }

  // 2. Upload clinic photos
  const clinicPhotoUrls: string[] = []
  for (let i = 0; i < form.clinicPhotos.length; i++) {
    const file = form.clinicPhotos[i]
    const ext  = file.name.split(".").pop()
    const path = `${userId}/clinic/${i}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from("doctor-photos")
      .upload(path, file)
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from("doctor-photos").getPublicUrl(path)
    clinicPhotoUrls.push(urlData.publicUrl)
  }

  // 3. Upsert profile row
  const { data, error } = await supabase
    .from("doctor_profiles")
    .upsert({
      user_id:             userId,
      photo_url:           photoUrl,
      clinic_photo_urls:   clinicPhotoUrls,
      title:               form.title,
      first_name:          form.firstName,
      last_name:           form.lastName,
      designation:         form.designation,
      about:               form.about,
      specialization:      form.specialization,
      sub_specialization:  form.subSpecialization,
      experience_years:    form.experience ? parseInt(form.experience) : null,
      qualifications:      form.qualifications,
      registration_no:     form.registrationNo,
      clinic_name:         form.clinicName,
      hospital:            form.hospital,
      address:             form.address,
      city:                form.city,
      state:               form.state,
      zip:                 form.zip,
      phone:               form.phone,
      email:               form.email,
      website:             form.website,
      languages:           form.languages,
      base_fee:            form.baseFee ? parseFloat(form.baseFee) : null,
      availability:        form.availability,
      member_since:        form.memberSince || null,
      patients_served:     form.patientsServed ? parseInt(form.patientsServed) : null,
      rating:              form.rating ? parseFloat(form.rating) : null,
    }, { onConflict: "user_id" })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Fetch doctor profile ─────────────────────────────────────
export async function fetchDoctorProfile(userId: string) {
  const { data, error } = await supabase
    .from("doctor_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) throw error
  return data
}