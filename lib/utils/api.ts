import { supabase } from '@/lib/supabase'

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean
}

async function getSessionToken(): Promise<string | null> {
  let { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const { data } = await supabase.auth.getSession()
    session = data.session
  }
  
  if (!session) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.auth.getSession()
      session = data.session
    }
  }
  
  return session?.access_token || null
}

export async function authFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requiresAuth = true, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (requiresAuth) {
    const token = await getSessionToken()

    if (!token) {
      throw new Error('Not authenticated')
    }

    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...fetchOptions,
    headers,
  })
}
