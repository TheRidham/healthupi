import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServiceClient } from '@/lib/supabase-server';

// Tell Next.js not to parse body — we need raw bytes for signature verification
export const config = {
  api: { bodyParser: false },
};

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // 2. Verify webhook signature — reject if invalid
    const isValid = verifyWebhookSignature(
      rawBody,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET!
    );

    if (!isValid) {
      console.warn('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 3. Parse the verified payload
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // 4. Handle relevant events
    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      default:
        // Log unhandled events but still return 200 (so Razorpay doesn't retry)
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    // Return 500 so Razorpay retries the webhook
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentCaptured(payment: any) {
  const supabase = getSupabaseServiceClient();

  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', payment.order_id)
    .single();

  if (findError || !order) {
    console.error('Order not found for payment:', payment.order_id);
    return;
  }

  // Idempotency check — don't process already paid orders
  if (order.status === 'paid') {
    console.log('Order already marked as paid, skipping:', order.id);
    return;
  }

  // Update order status to paid
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      razorpay_payment_id: payment.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (updateError) {
    console.error('Failed to update order:', updateError);
    throw updateError; // Throw so Razorpay retries
  }

  // Unlock features for user
  await unlockUserFeatures(order.user_id, order);

  // Send confirmation email
  await sendConfirmationEmail(order.user_id, order, payment);

  console.log(`Payment captured for order: ${order.id}`);
}

async function handlePaymentFailed(payment: any) {
  const supabase = getSupabaseServiceClient();

  await supabase
    .from('orders')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', payment.order_id);

  console.log(`Payment failed for Razorpay order: ${payment.order_id}`);
}

async function unlockUserFeatures(userId: string, order: any) {
  const supabase = getSupabaseServiceClient();
  
  // Example: update a user profile or subscriptions table
  // Customize based on your use case
  const { error } = await supabase
    .from('user_access') // your own table
    .upsert({
      user_id: userId,
      has_access: true,
      granted_at: new Date().toISOString(),
    });

  if (error) console.error('Failed to unlock features:', error);
}

async function sendConfirmationEmail(userId: string, order: any, payment: any) {
  // Option 1: Use Supabase Edge Function to send email via Resend/SendGrid
  // Option 2: Call your email API directly
  // Option 3: Use Supabase DB trigger + pg_net extension

  // Example with fetch to your email service:
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
        amount: order.amount / 100, // convert paise to rupees
        payment_id: payment.id,
      }),
    });
  } catch (error) {
    // Don't throw — email failure shouldn't break payment confirmation
    console.error('Email send failed:', error);
  }
}