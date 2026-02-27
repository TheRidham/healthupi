export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const tables = {
  users: "users",
  doctors: "doctors",
  services: "services",
  timeSlots: "time_slots",
  appointments: "appointments",
  payments: "payments",
  chatMessages: "chat_messages",
  videoCalls: "video_calls",
  notifications: "notifications",
}

export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not configured")
  }
  // TODO: import { createClient } from '@supabase/supabase-js'
  // return createClient(supabaseUrl, supabaseAnonKey)
  return null
}
