import { NextResponse, NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("doctor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
 
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
 
    const body = await req.json()
 
    // Strip fields that must never be overwritten from the client
    const { id, user_id, created_at, ...updatableFields } = body
 
    const { data, error } = await supabase
      .from("doctor_profiles")
      .update({ ...updatableFields, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .select()
      .single()
 
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
 
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}