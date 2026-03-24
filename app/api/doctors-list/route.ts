import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // TODO: wire up search & specialization filters when needed
    // const { searchParams } = new URL(req.url)
    // const search = searchParams.get("search")?.trim() ?? ""
    // const specialization = searchParams.get("specialization")?.trim() ?? ""

    const { data, error } = await supabase
      .from("doctor_profiles")
      .select(
        "user_id, first_name, last_name, designation, specialization, sub_specialization, experience_years, rating, photo_url, clinic_name, city, state, availability, patients_served"
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[/api/doctors]", error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const doctors = (data ?? []).map((doc) => ({
      id: doc.user_id,
      name: [doc.first_name, doc.last_name].filter(Boolean).join(" "),
      title: doc.designation ?? "Doctor",
      specialization: doc.specialization ?? "General",
      subSpecialization: doc.sub_specialization ?? "",
      experience: doc.experience_years != null ? `${doc.experience_years} yrs exp.` : "",
      rating: doc.rating != null ? Number(doc.rating) : 0,
      reviewCount: doc.patients_served ?? 0,
      clinicName: doc.clinic_name ?? "",
      location: [doc.city, doc.state].filter(Boolean).join(", "),
      avatar: doc.photo_url ?? "/placeholder-doctor.png",
      available: doc.availability === "online" || doc.availability === "both",
    }))

    return NextResponse.json({ success: true, data: doctors })
  } catch (err: any) {
    console.error("[/api/doctors] Unexpected error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}