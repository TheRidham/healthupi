import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorIdOrSlug } = await context.params
    
    console.log('[API Doctor] Fetching doctor:', { doctorIdOrSlug })

    const isUuid = doctorIdOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)

    let doctor: any = null

    if (isUuid) {
      // Direct UUID lookup
      const result = await supabaseAdmin
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', doctorIdOrSlug)
        .single()
      
      doctor = result.data
    } else {
      // Try first_name + last_name from slug
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
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Fetch doctor services
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('doctor_services')
      .select(`
        fee,
        enabled,
        service_id,
        services!inner(id, name, type, description, price, duration_minutes, icon)
      `)
      .eq('doctor_id', doctor.user_id)
      .eq('enabled', true)

    if (servicesError) {
      console.error('[API Doctor] Error fetching services:', servicesError)
    }

    // Format services
    const formattedServices = (services || []).map((ds: any) => ({
      id: ds.service_id,
      type: ds.services?.type || 'service',
      name: ds.services?.name || '',
      icon: ds.services?.icon || '',
      price: ds.fee || ds.services?.price || 0,
      enabled: ds.enabled,
      description: ds.services?.description || '',
    }))

    // Format doctor for frontend
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

    console.log('[API Doctor] Found doctor:', formattedDoctor.name)

    return NextResponse.json({
      success: true,
      data: formattedDoctor,
    })
  } catch (error: any) {
    console.error('[API Doctor] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
