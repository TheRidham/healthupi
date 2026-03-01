import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null

// Map user_id to slug for routing
function userToSlug(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
}

export async function GET(request: NextRequest) {
  // Check if Supabase client is available
  if (!supabaseAdmin) {
    console.error('[API Doctors] Supabase client not initialized:', {
      urlSet: !!supabaseUrl,
      serviceKeySet: !!supabaseServiceRoleKey,
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server configuration error: Missing Supabase environment variables' 
      },
      { status: 500 }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const specialization = searchParams.get('specialization')

    console.log('[API Doctors] Fetching doctors:', { search, specialization })

    let query = supabaseAdmin
      .from('doctor_profiles')
      .select(`
        user_id,
        id,
        first_name,
        last_name,
        title,
        photo_url,
        specialization,
        sub_specialization,
        experience_years,
        about,
        qualifications,
        registration_no,
        clinic_name,
        hospital,
        address,
        city,
        state,
        zip,
        phone,
        email,
        website,
        languages,
        base_fee,
        availability,
        member_since,
        patients_served,
        rating,
        clinic_photo_urls
      `)
      .order('rating', { ascending: false })

    const { data: doctors, error } = await query

    if (error) {
      console.error('[API Doctors] Database error:', error)
      console.error('[API Doctors] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Format doctors for frontend
    const formattedDoctors = (doctors || []).map(doctor => {
      const slug = userToSlug(doctor.first_name, doctor.last_name)

      return {
        id: slug, // Use slug as ID for routing
        user_id: doctor.user_id,
        name: `${doctor.title} ${doctor.first_name} ${doctor.last_name}`.trim(),
        title: '',
        specialization: doctor.specialization || '',
        subSpecialization: doctor.sub_specialization || '',
        experience: `${doctor.experience_years} years`,
        experience_years: doctor.experience_years,
        rating: doctor.rating || 0,
        reviewCount: doctor.patients_served ? parseInt(String(doctor.patients_served)) : 0,
        clinicName: doctor.clinic_name || '',
        location: `${doctor.city}, ${doctor.state}`.trim(),
        address: doctor.address,
        phone: doctor.phone,
        email: doctor.email,
        website: doctor.website,
        languages: doctor.languages || [],
        qualifications: doctor.qualifications || [],
        about: doctor.about || '',
        base_fee: doctor.base_fee,
        avatar: doctor.photo_url || '/images/doctor-avatar.jpg',
        clinicPhotoUrls: doctor.clinic_photo_urls || [],
        available: doctor.availability === 'online',
        memberSince: doctor.member_since,
        patientsServed: doctor.patients_served || 0,
      }
    })

    // Filter client-side if needed
    let filtered = formattedDoctors
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchLower) ||
        d.specialization.toLowerCase().includes(searchLower) ||
        d.clinicName.toLowerCase().includes(searchLower)
      )
    }

    if (specialization && specialization !== 'All Specializations') {
      filtered = filtered.filter(d =>
        d.specialization === specialization ||
        d.subSpecialization === specialization
      )
    }

    console.log('[API Doctors] Returning:', filtered.length, 'doctors')

    return NextResponse.json({
      success: true,
      data: filtered,
    })
  } catch (error: any) {
    console.error('[API Doctors] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
