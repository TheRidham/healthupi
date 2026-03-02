import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/server/supabase-admin";

export async function POST(req: NextRequest) {
  try {
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

    const userId = metadata.patient_id;
    if (!userId) {
      return NextResponse.json({ error: "patient_id is required in metadata" }, { status: 400 });
    }

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        user_id: userId,
        ...metadata,
      },
    });

    const { data: order, error: dbError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        razorpay_order_id: razorpayOrder.id,
        amount,
        currency,
        status: "created",
        metadata,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to save order" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
