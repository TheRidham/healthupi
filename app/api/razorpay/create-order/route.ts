import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();

    const {
      amount,
      currency = "INR",
      type,
      patient_id,
      doctor_id,
      metadata = {},
    } = body;

    // ✅ 1. Validate amount
    if (!amount || typeof amount !== "number" || amount < 100) {
      return NextResponse.json(
        { error: "Invalid amount (minimum ₹1 = 100 paise)" },
        { status: 400 },
      );
    }

    // ✅ 2. Validate type
    if (!type || !["appointment", "registration"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type (appointment / registration)" },
        { status: 400 },
      );
    }

    // ✅ 3. Conditional validation (matches DB constraint)
    if (type === "appointment") {
      if (!patient_id || !doctor_id) {
        return NextResponse.json(
          { error: "patient_id and doctor_id required for appointment" },
          { status: 400 },
        );
      }
    }

    if (type === "registration") {
      if (!doctor_id) {
        return NextResponse.json(
          { error: "doctor_id required for registration" },
          { status: 400 },
        );
      }
    }

    // 🔹 4. Create Razorpay order
    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        type,
        patient_id,
        doctor_id,
        ...metadata,
      },
    });

    // 🔹 5. Prepare DB insert (aligned with schema)
    const insertData: any = {
      type,
      razorpay_order_id: razorpayOrder.id,
      amount,
      currency,
      status: "created",
      metadata,
    };

    if (type === "appointment") {
      insertData.patient_id = patient_id;
      insertData.doctor_id = doctor_id;
    }

    if (type === "registration") {
      insertData.doctor_id = doctor_id;
    }

    // 🔹 6. Insert into DB
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert(insertData)
      .select()
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    // ✅ 7. Response
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order.id,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
