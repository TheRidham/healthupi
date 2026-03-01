import { createClient } from '@supabase/supabase-js'
import { config } from './config'

export const supabaseUrl = config.supabase.supabaseUrl
export const supabaseAnonKey = config.supabase.supabaseAnonKey
export const supabaseServiceRoleKey = config.supabase.supabaseServiceRoleKey

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

function createSupabase(supabaseUrl: string, supabaseAnonKey: string, serviceRoleKey?: string) {
  console.log('[Supabase] Creating client with:', {
    url: supabaseUrl ? 'set' : 'not set',
    anonKey: supabaseAnonKey ? 'set' : 'not set',
    serviceKey: serviceRoleKey ? 'set' : 'not set',
    serviceKeyLength: serviceRoleKey?.length || 0,
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not configured")
  }

  const keyToUse = serviceRoleKey || supabaseAnonKey

  const supa = createClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: true,
    },
    db: {
      schema: 'public',
    },
  })

  if (serviceRoleKey) {
    console.log('[Supabase] Creating admin client with service role key')
  } else {
    console.warn('[Supabase] No service role key provided, using anon key instead')
  }

  return supa;
}

export const supabase = createSupabase(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createSupabase(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey)