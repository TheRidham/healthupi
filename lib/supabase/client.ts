import { createBrowserClient } from '@supabase/ssr'

// This automatically uses a singleton instance in the browser
export function createClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}