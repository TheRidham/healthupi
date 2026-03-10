import { supabaseClient } from "./supabase-client";

const supabase = supabaseClient;

// ── Types ────────────────────────────────────────────────────
export interface DoctorFormData {
  //Step 0 — Basic Info
  photo: File | null;
  title: string;
  firstName: string;
  lastName: string;
  designation: string;
  about: string;

  //Step 1 — Professional
  specialization: string;
  subSpecialization: string;
  experience: string;
  qualifications: string[];
  registrationNo: string;

  //Step 2 — Clinic (+ photos NEW)
  clinicName: string;
  hospital: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  clinicPhotos: File[]; // ← NEW

  //Step 3 — Contact (email moved to Step 0)
  phone: string;
  website: string;
  googleMeetLink: string;
  languages: string[];

  //Step 4 — payment(account creation fee)
  isFeePaid: boolean;
  fee: string;

  //Step 5 — Account (NEW)
  email: string;
  password: string;
  confirmPassword: string;
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
  googleMeetLink: "",
  languages: [],
  isFeePaid: false,
  fee: "1000"
};

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
  });
  if (error) throw error;
  return data;
}

// ── Submit full doctor profile ───────────────────────────────
export async function submitDoctorProfile(
  form: DoctorFormData,
  userId: string,
) {
  console.log('📝 Starting profile submission for user:', userId)
  
  // 1. Upload avatar (only if provided)
  let photoUrl: string | null = null;
  if (form.photo) {
    console.log('📸 Uploading avatar...')
    try {
      const ext = form.photo.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("doctor-photos")
        .upload(path, form.photo, { upsert: true }); // ⚠️ Add upsert: true
      
      if (uploadError) {
        console.error('❌ Avatar upload error:', uploadError)
        throw new Error(`Avatar upload failed: ${uploadError.message}`)
      }
      
      const { data: urlData } = supabase.storage
        .from("doctor-photos")
        .getPublicUrl(path);
      photoUrl = urlData.publicUrl;
      console.log('✅ Avatar uploaded:', photoUrl)
    } catch (err: any) {
      console.error('❌ Avatar upload failed:', err)
      // Continue without photo instead of failing completely
      photoUrl = null
    }
  }

  // 2. Upload clinic photos
  const clinicPhotoUrls: string[] = [];
  if (form.clinicPhotos && form.clinicPhotos.length > 0) {
    console.log(`📸 Uploading ${form.clinicPhotos.length} clinic photos...`)
    for (let i = 0; i < form.clinicPhotos.length; i++) {
      try {
        const file = form.clinicPhotos[i];
        const ext = file.name.split(".").pop();
        const path = `${userId}/clinic/${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("doctor-photos")
          .upload(path, file, { upsert: true }); // ⚠️ Add upsert: true
        
        if (uploadError) {
          console.error(`❌ Clinic photo ${i} upload error:`, uploadError)
          continue; // Skip this photo
        }
        
        const { data: urlData } = supabase.storage
          .from("doctor-photos")
          .getPublicUrl(path);
        clinicPhotoUrls.push(urlData.publicUrl);
      } catch (err) {
        console.error(`❌ Clinic photo ${i} failed:`, err)
        // Continue with other photos
      }
    }
    console.log(`✅ Uploaded ${clinicPhotoUrls.length} clinic photos`)
  }

  // 3. Upsert profile row
  console.log('💾 Saving profile to database...')
  const { data, error } = await supabase
    .from("doctor_profiles")
    .upsert(
      {
        user_id: userId,
        photo_url: photoUrl,
        clinic_photo_urls: clinicPhotoUrls,
        title: form.title,
        first_name: form.firstName,
        last_name: form.lastName,
        designation: form.designation,
        about: form.about,
        specialization: form.specialization,
        sub_specialization: form.subSpecialization,
        experience_years: form.experience ? parseInt(form.experience) : null,
        qualifications: form.qualifications,
        registration_no: form.registrationNo,
        clinic_name: form.clinicName,
        hospital: form.hospital,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        phone: form.phone,
        email: form.email,
        website: form.website,
        google_meet_link: form.googleMeetLink || null,
        languages: form.languages,
        isFeePaid: form.isFeePaid,
        fee: form.fee
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    console.error('❌ Database error:', error)
    throw error;
  }
  
  console.log('✅ Profile saved successfully!')
  return data;
}

// ── Fetch doctor profile ─────────────────────────────────────
export async function fetchDoctorProfile(userId: string) {
  const { data, error } = await supabase
    .from("doctor_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}
