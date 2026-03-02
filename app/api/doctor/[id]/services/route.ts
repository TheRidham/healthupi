import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { findDoctor } from '@/lib/server/doctor'
import { requireDoctor, handleAuthError } from '@/lib/server/auth'
import { successResponse, errorResponse } from '@/lib/server/response'

function validateServiceInput(body: any): { valid: boolean; error?: string } {
  const { service_id, enabled, fee } = body

  if (!service_id) {
    return { valid: false, error: 'service_id is required' }
  }

  if (enabled !== undefined && typeof enabled !== 'boolean') {
    return { valid: false, error: 'enabled must be a boolean' }
  }

  if (fee !== undefined && (typeof fee !== 'number' || fee < 0)) {
    return { valid: false, error: 'fee must be a positive number' }
  }

  return { valid: true }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await context.params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const doctor = await findDoctor(doctorId)
    if (!doctor) {
      return errorResponse('Doctor not found', 404)
    }

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

    if (servicesError) {
      return errorResponse(servicesError.message, 500)
    }

    if (action === 'available') {
      const existingServiceIds = (doctorServices || []).map((ds: any) => ds.services.id)

      if (existingServiceIds.length === 0) {
        const { data: allServices } = await supabaseAdmin
          .from('services')
          .select('*')
        return successResponse(allServices || [])
      }

      const { data: allServices } = await supabaseAdmin
        .from('services')
        .select('*')
        .not('id', 'in', `(${existingServiceIds.map((id: string) => `"${id}"`).join(',')})`)

      return successResponse(allServices || [])
    }

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

    const regularServices = formattedServices.filter((s: any) => s.type === 'service')
    const followUpServices = formattedServices.filter((s: any) => s.type === 'followup')

    return successResponse({
      doctor: {
        user_id: doctor.user_id,
        name: `${doctor.first_name} ${doctor.last_name}`,
      },
      services: regularServices,
      followups: followUpServices,
      all: formattedServices,
    })
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
    const { id: doctorId } = await context.params
    const body = await request.json()

    const validation = validateServiceInput(body)
    if (!validation.valid) {
      return errorResponse(validation.error!, 400)
    }

    const { service_id, enabled, fee } = body
    const doctor = await findDoctor(doctorId)

    if (!doctor) {
      return errorResponse('Doctor not found', 404)
    }

    if (doctor.user_id !== authUser.id) {
      return errorResponse('Cannot modify another doctor\'s data', 403)
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    if (enabled !== undefined) updateData.enabled = enabled
    if (fee !== undefined) updateData.fee = fee

    const { data: updatedService, error: updateError } = await supabaseAdmin
      .from('doctor_services')
      .update(updateData)
      .eq('doctor_id', doctor.user_id)
      .eq('service_id', service_id)
      .select()
      .single()

    if (updateError || !updatedService) {
      return errorResponse(updateError?.message || 'Service not found for this doctor', 500)
    }

    return successResponse(updatedService)
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireDoctor(request)
    const { id: doctorId } = await context.params
    const body = await request.json()

    const validation = validateServiceInput(body)
    if (!validation.valid) {
      return errorResponse(validation.error!, 400)
    }

    const { service_id, fee, enabled = true } = body
    const doctor = await findDoctor(doctorId)

    if (!doctor) {
      return errorResponse('Doctor not found', 404)
    }

    if (doctor.user_id !== authUser.id) {
      return errorResponse('Cannot modify another doctor\'s data', 403)
    }

    let finalFee = fee
    if (!finalFee) {
      const { data: service } = await supabaseAdmin
        .from('services')
        .select('price')
        .eq('id', service_id)
        .single()

      finalFee = service?.price || 0
    }

    const { data: existing } = await supabaseAdmin
      .from('doctor_services')
      .select('id')
      .eq('doctor_id', doctor.user_id)
      .eq('service_id', service_id)
      .single()

    if (existing) {
      return errorResponse('Service already added', 400)
    }

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
      return errorResponse(insertError.message, 500)
    }

    return successResponse(newService, 201)
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error)
    }
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}
