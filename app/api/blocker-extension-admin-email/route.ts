import { Resend } from 'resend';
import { createClient } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize KV
const kv = createClient({
  url: process.env.HEALTHUPI_KV_REST_API_URL!,
  token: process.env.HEALTHUPI_KV_REST_API_TOKEN!,
});

// Your Chrome extension IDs (comma-separated in env)
const EXTENSION_IDS = (process.env.EXTENSION_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

// Build allowed origins from extension IDs
const ALLOWED_EXTENSION_ORIGINS = EXTENSION_IDS.map(
  id => `chrome-extension://${id}`
);

// Rate limiter
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
});

// ==========================================
// OPTIONS (CORS PREFLIGHT)
// ==========================================
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  // Check if origin is allowed
  const isAllowedOrigin = origin && ALLOWED_EXTENSION_ORIGINS.includes(origin);

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ==========================================
// POST
// ==========================================
export async function POST(req: NextRequest) {
  const adminEmail = process.env.EXTENSION_ADMIN_EMAIL;
  
  // Get request origin
  const origin = req.headers.get('origin');
  
  // Check if origin is allowed
  const isAllowedOrigin = origin && ALLOWED_EXTENSION_ORIGINS.includes(origin);

  // Base headers with proper origin
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
    'Access-Control-Allow-Methods': 'OPTIONS, POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // ==========================================
  // LAYER 1: STRICT ORIGIN CHECKING
  // ==========================================
  if (!isAllowedOrigin) {
    return NextResponse.json(
      { error: 'Forbidden' },
      {
        status: 403,
        headers,
      }
    );
  }

  // ==========================================
  // LAYER 2: IP RATE LIMITING
  // ==========================================
  const forwardedFor = req.headers.get('x-forwarded-for');

  const ip =
    forwardedFor?.split(',')[0]?.trim() || '127.0.0.1';

  const { success: rateLimitSuccess } =
    await ratelimit.limit(`ratelimit_${ip}`);

  if (!rateLimitSuccess) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers,
      }
    );
  }

  // Parse body
  const body = await req.json();

  const { userEmail, requestedSite, email } = body;

  // Validation
  if (
    !userEmail ||
    !userEmail.includes('@') ||
    !requestedSite
  ) {
    return NextResponse.json(
      { error: 'Invalid input data' },
      {
        status: 400,
        headers,
      }
    );
  }

  // ==========================================
  // LAYER 3: BUSINESS LOGIC THROTTLING
  // ==========================================
  const duplicateKey = `req:${userEmail}:${requestedSite}`;

  const hasRequestedRecently =
    await kv.get(duplicateKey);

  if (hasRequestedRecently) {
    return NextResponse.json(
      {
        success: true,
        note: 'Throttled duplicate',
      },
      {
        status: 200,
        headers,
      }
    );
  }

  // ==========================================
  // SEND EMAIL
  // ==========================================
  try {
    const res = await resend.emails.send({
      from: `Extension Alerts <extension@healthbase.app>`,
      to: adminEmail || "",
      subject: email.subject,
      html: email.html
    });

    // Expire after 24h
    await kv.set(duplicateKey, 'true', {
      ex: 86400,
    });

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error('Resend Error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers,
      }
    );
  }
}
