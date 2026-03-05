import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebase/firebaseAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const phone = decoded.phone_number;

    if (!phone) {
      return NextResponse.json({ error: "Phone not found" }, { status: 400 });
    }

    let userId: string;

    // 1. Check patient_details first
    const { data: patient, error: patientError } = await supabaseAdmin
      .from("patient_details")
      .select("id")
      .eq("phone", phone)
      .maybeSingle(); // use maybeSingle() instead of single() to avoid errors on no rows

    console.log("patient: ", patient, "patientError: ", patientError);

    if (patient) {
      userId = patient.id;
    } else {
      // 2. Check if auth user already exists (avoids duplicate creation error)
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.phone === phone
      );

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // 3. Create new auth user
        const { data: newUser, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            phone,
            phone_confirm: true,
          });

        console.log("newUser: ", newUser, "createError: ", createError);

        if (!newUser?.user?.id) {
          return NextResponse.json(
            { error: "User creation failed", detail: createError?.message },
            { status: 500 }
          );
        }

        userId = newUser.user.id;
      }

      // 4. Insert patient_details — only with fields that are available now
      //    full_name, age, gender are required by schema — you must collect
      //    these before inserting, or make them nullable in your schema
      const { error: insertError } = await supabaseAdmin
        .from("patient_details")
        .insert({
          id: userId,
          phone,
          // TODO: pass full_name, age, gender from request body
          // or alter the schema to make them nullable for initial registration
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          { error: "Patient record creation failed", detail: insertError.message },
          { status: 500 }
        );
      }
    }

    // 5. Generate session via magic link
    //    Note: the user must have an email in auth.users for generateLink to work
    const emailFromPhone = `${phone.replace("+", "")}@phone.healthupi.local`;

    // Ensure the auth user has this email set
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: emailFromPhone,
      email_confirm: true,
    });

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: emailFromPhone,
      });

    console.log("linkData: ", linkData, "linkError: ", linkError);

    const accessToken = linkData?.properties?.hashed_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Session generation failed", detail: linkError?.message },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ success: true });

    res.cookies.set("sb-access-token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set("sb-refresh-token", accessToken, { // use a real refresh token if available
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}