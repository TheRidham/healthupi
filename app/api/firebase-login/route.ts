// app/api/auth/phone/route.ts
// Verifies Firebase phone idToken, then finds-or-creates the Supabase
// user + patient_profiles row. Returns a session cookie.

import { NextRequest, NextResponse } from 'next/server'
import admin from '@/lib/firebase/firebaseAdmin'
import { formatPhoneForDB, findOrCreatePatientByPhone, generateSessionToken } from '@/services/patient.auth.service'

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    // 1. Verify Firebase token → get phone
    const decoded = await admin.auth().verifyIdToken(idToken)
    const rawPhone = decoded.phone_number

    if (!rawPhone) {
      return NextResponse.json({ error: 'Phone not found in token' }, { status: 400 })
    }

    const phone = formatPhoneForDB(rawPhone)

    // 2. Find or create auth user + minimal patient_profiles row
    const { success, userId, userExist, profile, error } = await findOrCreatePatientByPhone(phone)

    if (!success || !userId) {
      return NextResponse.json({ error: error ?? 'Auth setup failed' }, { status: 500 })
    }

    // 3. Create a real Supabase session directly — no magic link, no expiry race
    const { accessToken, refreshToken } = await generateSessionToken(userId, phone)

    if (!accessToken) {
      return NextResponse.json({ error: 'Session generation failed' }, { status: 500 })
    }

    // 4. Set real JWTs as httpOnly cookies + return profile info
    const res = NextResponse.json({ success: true, userExist, profile, accessToken, refreshToken })

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }

    res.cookies.set('sb-access-token', accessToken, cookieOptions)
    res.cookies.set('sb-refresh-token', refreshToken, cookieOptions)

    return res;

  } catch (err) {
    console.error('Auth route error:', err)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }
}