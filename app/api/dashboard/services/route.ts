import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/dashboard/services — fetch this doctor's services (joined with services table)
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("doctor_services")
      .select(`
        service_id,
        enabled,
        fee,
        services (
          id,
          name,
          type,
          description,
          duration_minutes,
          icon
        )
      `)
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Flatten joined data
    const result = (data ?? []).map((row: any) => ({
      service_id: row.service_id,
      enabled: row.enabled,
      fee: Number(row.fee ?? 0),
      name: row.services?.name ?? "",
      type: row.services?.type ?? "",
      description: row.services?.description ?? null,
      duration_minutes: row.services?.duration_minutes ?? null,
      icon: row.services?.icon ?? null,
    }))

    return NextResponse.json({ success: true, data: result })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/dashboard/services — add a service
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { service_id, fee, enabled } = await req.json()

    if (!service_id) {
      return NextResponse.json({ success: false, error: "service_id is required" }, { status: 400 })
    }

    const { error } = await supabase.from("doctor_services").insert({
      doctor_id: user.id,
      service_id,
      fee: fee ?? 0,
      enabled: enabled ?? true,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}