import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { findDoctor, getDoctorByUserId } from '@/lib/server/doctor'
import { requireDoctor, handleAuthError } from '@/lib/server/auth'
import { successResponse, errorResponse } from '@/lib/server/response'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorIdOrSlug } = await context.params
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctorIdOrSlug)

    let doctor: any = null

    if (isUuid) {
      const result = await supabaseAdmin
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', doctorIdOrSlug)
        .single()
      doctor = result.data
    } else {
      const parts = doctorIdOrSlug.split('-')
      if (parts.length >= 2) {
        const firstName = parts[0]
        const lastName = parts.slice(1).join(' ')

        const result = await supabaseAdmin
          .from('doctor_profiles')
          .select('*')
          .ilike('first_name', firstName)
          .ilike('last_name', lastName)
          .limit(1)
          .single()
        doctor = result.data
      }
    }

    if (!doctor) {
      return errorResponse('Doctor not found', 404)
    }

    const { data: doctorServices, error: servicesError } = await supabaseAdmin
      .from('doctor_services')
      .select('fee, enabled, service_id')
      .eq('doctor_id', doctor.user_id)
      .eq('enabled', true)

    const { data: allServices } = await supabaseAdmin
      .from('services')
      .select('id, name, type, description, price, duration_minutes, icon')

    const serviceMap = new Map((allServices || []).map(s => [s.id, s]))

    const formattedServices = (doctorServices || []).map((ds: any) => {
      const service = serviceMap.get(ds.service_id)
      return {
        id: ds.service_id,
        type: service?.type || 'service',
        name: service?.name || '',
        icon: service?.icon || '',
        price: ds.fee || service?.price || 0,
        enabled: ds.enabled,
        description: service?.description || '',
      }
    })

    const formattedDoctor = {
      id: doctorIdOrSlug,
      user_id: doctor.user_id,
      name: `${doctor.title || 'Dr.'} ${doctor.first_name} ${doctor.last_name}`.trim(),
      title: doctor.title || '',
      specialization: doctor.specialization || '',
      subSpecialization: doctor.sub_specialization || '',
      experience: `${doctor.experience_years || 0} years`,
      experience_years: doctor.experience_years,
      qualifications: doctor.qualifications || [],
      registrationNumber: doctor.registration_no || '',
      clinicName: doctor.clinic_name || doctor.hospital || '',
      address: doctor.address || '',
      city: doctor.city || '',
      state: doctor.state || '',
      zip: doctor.zip || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      website: doctor.website || '',
      googleMeetLink: doctor.google_meet_link || '',
      languages: doctor.languages || [],
      base_fee: doctor.base_fee,
      availability: doctor.availability,
      rating: doctor.rating || 0,
      reviewCount: doctor.patients_served || 0,
      patientsServed: `${doctor.patients_served || 0}+`,
      about: doctor.about || '',
      avatar: doctor.photo_url || '/images/doctor-avatar.jpg',
      clinicPhotoUrls: doctor.clinic_photo_urls || [],
      galleryImages: (doctor.clinic_photo_urls || []).map((url: string) => ({
        src: url,
        alt: `${doctor.clinic_name || 'Clinic'} photo`,
      })),
      services: formattedServices,
    }

    return successResponse(formattedDoctor)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireDoctor(request)
    const { id: doctorIdOrSlug } = await context.params
    const body = await request.json()

    const doctor = await findDoctor(doctorIdOrSlug)
    if (!doctor) {
      return errorResponse('Doctor not found', 404)
    }

    if (doctor.user_id !== authUser.id) {
      return errorResponse('Cannot modify another doctor\'s profile', 403)
    }

    const allowedFields = [
      'title', 'first_name', 'last_name', 'designation', 'about',
      'specialization', 'sub_specialization', 'experience_years',
      'qualifications', 'registration_no', 'clinic_name', 'hospital',
      'address', 'city', 'state', 'zip', 'phone', 'email', 'website',
      'google_meet_link', 'languages', 'base_fee', 'availability', 'photo_url', 'clinic_photo_urls'
    ]

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const { data: updatedDoctor, error } = await supabaseAdmin
      .from('doctor_profiles')
      .update(updateData)
      .eq('user_id', doctor.user_id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse(updatedDoctor)
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}
