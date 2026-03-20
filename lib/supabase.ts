import { createBrowserClient } from '@supabase/ssr'
import { config } from './config'

export const supabaseUrl = config.supabase.supabaseUrl
export const supabaseAnonKey = config.supabase.supabaseAnonKey

// Browser client that syncs session to cookies automatically
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)
