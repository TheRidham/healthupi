import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
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

    // Check if patient profile exists
    const { data: profile, error: profileError } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("user_id", user.id)
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

export async function PUT(req: NextRequest) {
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
      date_of_birth,
      gender,
      blood_group,
      email,
      address,
      city,
      state,
      zip,
      allergies,
      medical_conditions,
      photo_url,
    } = body;

    // Build update object with only non-null values
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined && name !== null) updateData.name = name;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
    if (gender !== undefined) updateData.gender = gender;
    if (blood_group !== undefined) updateData.blood_group = blood_group;
    if (email !== undefined && email !== null) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip !== undefined) updateData.zip = zip;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (medical_conditions !== undefined) updateData.medical_conditions = medical_conditions;
    if (photo_url !== undefined) updateData.photo_url = photo_url;

    // Update patient profile
    const { data: profile, error: updateError } = await supabase
      .from("patient_profiles")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating patient profile:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update patient profile" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Patient profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Unexpected error in patient profile PUT:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
