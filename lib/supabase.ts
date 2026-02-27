import { createClient } from "@supabase/supabase-js";


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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);