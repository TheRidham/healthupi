import { createBrowserClient } from '@supabase/ssr'
import { config } from './config'

export const supabaseUrl = config.supabase.supabaseUrl
export const supabaseAnonKey = config.supabase.supabaseAnonKey

// Browser client that syncs session to cookies automatically
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)

export const tables = {
  users: "users",
  doctors: "doctors",
  patientProfiles: "patient_profiles",
  services: "services",
  timeSlots: "time_slots",
  appointments: "appointments",
  payments: "payments",
  chatMessages: "messages",
  videoCalls: "video_calls",
  notifications: "notifications",
}
