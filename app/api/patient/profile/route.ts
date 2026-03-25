import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if patient profile exists
    const { data: profile, error: profileError } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching patient profile:", profileError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch patient profile" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Unexpected error in patient profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      gender,
      phone,
      email,
      address,
      age, // optional - used to calculate date_of_birth
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    // Upsert patient profile
    const { data: profile, error: upsertError } = await supabase
      .from("patient_profiles")
      .upsert(
        {
          user_id: user.id,
          name,
          gender: gender || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          date_of_birth: age
            ? new Date(new Date().getFullYear() - age, 0, 1)
                .toISOString()
                .split("T")[0]
            : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Error upserting patient profile:", upsertError);
      return NextResponse.json(
        { success: false, error: "Failed to save patient profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Unexpected error in patient profile POST:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
