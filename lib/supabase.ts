import { createClient } from '@supabase/supabase-js'
import { config } from './config'

export const supabaseUrl = config.supabase.supabaseUrl
export const supabaseAnonKey = config.supabase.supabaseAnonKey

export const tables = {
  users: "users",
  doctors: "doctors",
  patientProfiles: "patient_profiles",
  services: "services",
  timeSlots: "time_slots",
  appointments: "appointments",
  payments: "payments",
  chatMessages: "messages", // update messaages policy in db to allow authenticated users only
  videoCalls: "video_calls",
  notifications: "notifications",
}

function createSupabase(supabaseUrl: string, supabaseAnonKey: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not configured")
  }
  const supa = createClient(supabaseUrl, supabaseAnonKey)
  return supa;
}


export const supabase = createSupabase(supabaseUrl, supabaseAnonKey);