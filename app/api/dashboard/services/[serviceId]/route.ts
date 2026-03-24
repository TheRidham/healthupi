import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Params = { params: Promise<{ serviceId: string }> }

// PATCH /api/dashboard/services/[serviceId] — update enabled or fee
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient()
    const { serviceId } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    if (typeof body.enabled === "boolean") updates.enabled = body.enabled
    if (typeof body.fee === "number") updates.fee = body.fee

    const { error } = await supabase
      .from("doctor_services")
      .update(updates)
      .eq("doctor_id", user.id)
      .eq("service_id", serviceId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/dashboard/services/[serviceId] — remove a service from doctor
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient()
    const { serviceId } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("doctor_services")
      .delete()
      .eq("doctor_id", user.id)
      .eq("service_id", serviceId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}