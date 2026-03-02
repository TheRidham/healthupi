import { createClient } from '@supabase/supabase-js'
import { config } from './config'

export const supabaseUrl = config.supabase.supabaseUrl
export const supabaseAnonKey = config.supabase.supabaseAnonKey

export const tables = {
  users: "users",
  doctors: "doctors",
  services: "services",
  timeSlots: "time_slots",
  appointments: "appointments",
  payments: "payments",
  chatMessages: "messages",
  videoCalls: "video_calls",
  notifications: "notifications",
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
  db: {
    schema: 'public',
  },
})
