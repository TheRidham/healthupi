import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { cookie: cookieStore.toString() } } },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Get payment details from client
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    // 3. Verify signature manually
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

    // 4. Update order + create booking in DB
    const serviceSupabase = getSupabaseServiceClient();

    const { data: order } = await serviceSupabase
      .from("orders")
      .update({ status: "paid", razorpay_payment_id })
      .eq("razorpay_order_id", razorpay_order_id)
      .select()
      .single();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
