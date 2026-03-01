import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

async function findDoctor(doctorIdOrSlug: string): Promise<any> {
  const isUuid = doctorIdOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  
  if (isUuid) {
    console.log('[findDoctor] Looking up by UUID:', doctorIdOrSlug)
    const result = await supabaseAdmin
      .from('doctor_profiles')
      .select('user_id, first_name, last_name')
      .eq('user_id', doctorIdOrSlug)
      .single()
    console.log('[findDoctor] UUID result:', result.data, result.error)
    return result.data
  }
  
  console.log('[findDoctor] Looking up by slug:', doctorIdOrSlug)
  const parts = doctorIdOrSlug.split('-')
  if (parts.length >= 2) {
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')
    console.log('[findDoctor] Parsed name:', firstName, lastName)
    
    const result = await supabaseAdmin
      .from('doctor_profiles')
      .select('user_id, first_name, last_name')
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)
      .limit(1)
      .single()
    console.log('[findDoctor] Name result:', result.data, result.error)
    return result.data
  }
  return null
}

// GET: Fetch doctor's services
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    console.log('[API Doctor Services] Fetching services for doctor:', doctorId, 'action:', action)

    const isUuid = doctorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    
    let doctor: any = null

    if (isUuid) {
      console.log('[API Doctor Services] Looking up by UUID:', doctorId)
      const result = await supabaseAdmin
        .from('doctor_profiles')
        .select('user_id, first_name, last_name')
        .eq('user_id', doctorId)
        .single()
      console.log('[API Doctor Services] UUID lookup result:', result.data, result.error)
      doctor = result.data
    } else {
      // Try first_name + last_name
      const parts = doctorId.split('-')
      if (parts.length >= 2) {
        const firstName = parts[0]
        const lastName = parts.slice(1).join(' ')
        console.log('[API Doctor Services] Looking up by name:', firstName, lastName)
        
        const result = await supabaseAdmin
          .from('doctor_profiles')
          .select('user_id, first_name, last_name')
          .ilike('first_name', firstName)
          .ilike('last_name', lastName)
          .limit(1)
          .single()
        console.log('[API Doctor Services] Name lookup result:', result.data, result.error)
        doctor = result.data
      }
    }

    if (!doctor) {
      console.error('[API Doctor Services] Error finding doctor - doctor is null')
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      )
    }

    console.log('[API Doctor Services] Found doctor:', doctor.user_id)

    // Get all services for this doctor
    const { data: doctorServices, error: servicesError } = await supabaseAdmin
      .from('doctor_services')
      .select(`
        fee,
        enabled,
        created_at,
        updated_at,
        services!inner(
          id,
          name,
          type,
          description,
          price,
          duration_minutes,
          icon
        )
      `)
      .eq('doctor_id', doctor.user_id)

    console.log('[API Doctor Services] Doctor services:', doctorServices, servicesError)

    if (servicesError) {
      console.error('[API Doctor Services] Error fetching services:', servicesError)
      return NextResponse.json(
        { success: false, error: servicesError.message },
        { status: 500 }
      )
    }

    // If action=available, return services not yet added by this doctor
    if (action === 'available') {
      // Get existing service IDs for this doctor
      const existingServiceIds = (doctorServices || []).map((ds: any) => ds.services.id)
      
      // Get all services not in the doctor's list
      const { data: allServices, error: servicesError } = await supabaseAdmin
        .from('services')
        .select('*')
        .not('id', 'in', `(${existingServiceIds.map((id: string) => `"${id}"`).join(',')})`)

      if (servicesError) {
        console.error('[API Doctor Services] Error fetching available services:', servicesError)
        return NextResponse.json(
          { success: false, error: servicesError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: allServices || [],
      })
    }

    // Format the response
    const formattedServices = (doctorServices || []).map((ds: any) => ({
      id: ds.services.id,
      doctor_id: doctor.user_id,
      name: ds.services.name,
      type: ds.services.type,
      description: ds.services.description,
      basePrice: ds.services.price,
      fee: ds.fee,
      duration_minutes: ds.services.duration_minutes,
      icon: ds.services.icon,
      enabled: ds.enabled,
      created_at: ds.created_at,
      updated_at: ds.updated_at,
    }))

    // Separate regular services and follow-ups
    const regularServices = formattedServices.filter((s: any) => s.type === 'service')
    const followUpServices = formattedServices.filter((s: any) => s.type === 'followup')

    return NextResponse.json({
      success: true,
      data: {
        doctor: {
          user_id: doctor.user_id,
          slug: doctor.slug,
          name: `${doctor.first_name} ${doctor.last_name}`,
        },
        services: regularServices,
        followups: followUpServices,
        all: formattedServices,
      },
    })
  } catch (error: any) {
    console.error('[API Doctor Services] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update doctor service (enable/disable, set fee)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    const body = await request.json()
    const { service_id, enabled, fee } = body

    console.log('[API Doctor Services] Updating service:', { doctorId, service_id, enabled, fee })

    const doctor = await findDoctor(doctorId)
    console.log('[API Doctor Services] Found doctor:', doctor)
    
    if (!doctor) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 })
    }

    // Update the service
    const updateData: any = { updated_at: new Date().toISOString() }
    if (enabled !== undefined) updateData.enabled = enabled
    if (fee !== undefined) updateData.fee = fee

    console.log('[API Doctor Services] Update data:', updateData)
    console.log('[API Doctor Services] Matching doctor_id:', doctor.user_id, 'service_id:', service_id)

    const { data: updatedService, error: updateError } = await supabaseAdmin
      .from('doctor_services')
      .update(updateData)
      .eq('doctor_id', doctor.user_id)
      .eq('service_id', service_id)
      .select()

    console.log('[API Doctor Services] Update result:', { updatedService, updateError })

    if (updateError || !updatedService || updatedService.length === 0) {
      console.error('[API Doctor Services] Error updating service:', updateError)
      return NextResponse.json(
        { success: false, error: updateError?.message || 'Service not found for this doctor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedService[0],
    })
  } catch (error: any) {
    console.error('[API Doctor Services] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Add a new service for doctor
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    const body = await request.json()
    const { service_id, fee, enabled = true } = body

    console.log('[API Doctor Services] Adding service:', { doctorId, service_id, fee })

    // Find doctor using the helper function
    const doctor = await findDoctor(doctorId)
    
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Get service base price if not provided
    let finalFee = fee
    if (!finalFee) {
      const { data: service } = await supabaseAdmin
        .from('services')
        .select('price')
        .eq('id', service_id)
        .single()
      
      finalFee = service?.price || 0
    }

    // Add the service
    const { data: newService, error: insertError } = await supabaseAdmin
      .from('doctor_services')
      .insert({
        doctor_id: doctor.user_id,
        service_id,
        fee: finalFee,
        enabled,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[API Doctor Services] Error adding service:', insertError)
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newService,
    })
  } catch (error: any) {
    console.error('[API Doctor Services] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
