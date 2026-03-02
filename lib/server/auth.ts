import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase-admin'

export interface AuthUser {
  id: string
  email?: string
  role: 'doctor' | 'patient'
  doctorId?: string
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.replace('Bearer ', '')

  if (!bearerToken) {
    return null
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(bearerToken)

    if (error || !user) {
      return null
    }

    const { data: doctorProfile } = await supabaseAdmin
      .from('doctor_profiles')
      .select('user_id, email')
      .eq('user_id', user.id)
      .single()

    if (doctorProfile) {
      return {
        id: user.id,
        email: doctorProfile.email || user.email,
        role: 'doctor',
        doctorId: doctorProfile.user_id,
      }
    }

    const { data: patientProfile } = await supabaseAdmin
      .from('patient_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (patientProfile) {
      return {
        id: user.id,
        email: user.email || undefined,
        role: 'patient',
      }
    }

    return null
  } catch {
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request)

  if (!user) {
    throw new AuthError('Unauthorized', 401)
  }

  return user
}

export async function requireDoctor(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)

  if (user.role !== 'doctor') {
    throw new AuthError('Doctor access required', 403)
  }

  return user
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'AuthError'
  }
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    )
  }

  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}
