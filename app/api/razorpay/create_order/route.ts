import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user via Supabase session
    const cookieStore = cookies();
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { cookie: cookieStore.toString() },
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const { amount, currency = "INR", metadata = {} } = body;

    if (!amount || typeof amount !== "number" || amount < 100) {
      return NextResponse.json(
        {
          error:
            "Invalid amount. Must be a number in paise, minimum ₹1 (100 paise)",
        },
        { status: 400 },
      );
    }

    // 3. Create Razorpay order
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        user_id: user.id,
        ...metadata,
      },
    });

    // 4. Save order to Supabase with status 'created'
    const supabase = getSupabaseServiceClient();
    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        razorpay_order_id: razorpayOrder.id,
        amount,
        currency,
        status: "created",
        metadata,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save order" },
        { status: 500 },
      );
    }

    // 5. Return order details to client
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
