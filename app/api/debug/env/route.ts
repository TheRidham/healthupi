import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    SUPABASE_SERVICE_ROLE_KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
  }

  console.log('[Env Debug] Environment variables:', envVars)

  return NextResponse.json({
    success: true,
    data: envVars,
  })
}