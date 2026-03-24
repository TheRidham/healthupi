import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/dashboard/services/available — all services from the services master table
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("services")
      .select("id, name, type, description, price, duration_minutes, icon")
      .order("name", { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}