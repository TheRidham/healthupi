import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/server/supabase-admin';

export const config = {
  api: { bodyParser: false },
};

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(
      rawBody,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET!
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentCaptured(payment: any) {
  const { data: order, error: findError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', payment.order_id)
    .single();

  if (findError || !order) {
    return;
  }

  if (order.status === 'paid') {
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      razorpay_payment_id: payment.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (updateError) {
    throw updateError;
  }

  await unlockUserFeatures(order.user_id, order);
  await sendConfirmationEmail(order.user_id, order, payment);
}

async function handlePaymentFailed(payment: any) {
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', payment.order_id);
}

async function unlockUserFeatures(userId: string, order: any) {
  const { error } = await supabaseAdmin
    .from('user_access')
    .upsert({
      user_id: userId,
      has_access: true,
      granted_at: new Date().toISOString(),
    });

  if (error) {
  }
}

async function sendConfirmationEmail(userId: string, order: any, payment: any) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        user_id: userId,
        order_id: order.id,
        amount: order.amount / 100,
        payment_id: payment.id,
      }),
    });
  } catch (error) {
  }
}
