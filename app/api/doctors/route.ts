import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { successResponse, errorResponse } from '@/lib/server/response'

function userToSlug(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const specialization = searchParams.get('specialization')

    const { data: doctors, error } = await supabaseAdmin
      .from('doctor_profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        title,
        photo_url,
        specialization,
        sub_specialization,
        experience_years,
        about,
        qualifications,
        clinic_name,
        hospital,
        city,
        state,
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

    if (error) {
      return errorResponse(error.message, 500)
    }

    const formattedDoctors = (doctors || []).map(doctor => {
      const slug = userToSlug(doctor.first_name, doctor.last_name)
      return {
        id: slug,
        user_id: doctor.user_id,
        name: `${doctor.title} ${doctor.first_name} ${doctor.last_name}`.trim(),
        specialization: doctor.specialization || '',
        subSpecialization: doctor.sub_specialization || '',
        experience: `${doctor.experience_years} years`,
        experience_years: doctor.experience_years,
        rating: doctor.rating || 0,
        reviewCount: doctor.patients_served ? parseInt(String(doctor.patients_served)) : 0,
        clinicName: doctor.clinic_name || '',
        location: `${doctor.city}, ${doctor.state}`.trim(),
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

    return successResponse(filtered)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}
