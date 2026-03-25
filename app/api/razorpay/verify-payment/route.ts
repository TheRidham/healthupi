import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 },
      );
    }

    // ✅ 1. Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature),
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    // ✅ 2. Get order first (IMPORTANT)
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ 3. Idempotency check (VERY IMPORTANT 🚨)
    if (existingOrder.status === "paid") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // ✅ 4. Update order
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 },
      );
    }

    // ✅ 5. Update business tables based on type
    if (existingOrder.type === "appointment") {
      const appointmentId = existingOrder.metadata?.appointment_id;

      if (appointmentId) {
        await supabaseAdmin
          .from("appointments")
          .update({ payment_status: "paid" })
          .eq("id", appointmentId);
      }
    }

    if (existingOrder.type === "registration") {
      await supabaseAdmin
        .from("doctor_profiles")
        .update({ is_paid: true })
        .eq("user_id", existingOrder.doctor_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify payment error:", error);

    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
