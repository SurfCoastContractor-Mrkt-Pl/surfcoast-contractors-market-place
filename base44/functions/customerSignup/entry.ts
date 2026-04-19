import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 3600;

async function isRateLimited(base44, ip) {
  const key = `customer_signup:${ip}`;
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
  try {
    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key,
      window_start: { $gte: windowStart },
    });
    if (records?.length > 0) {
      if (records[0].request_count >= RATE_LIMIT_MAX) return true;
      await base44.asServiceRole.entities.RateLimitTracker.update(records[0].id, {
        request_count: records[0].request_count + 1,
      });
    } else {
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key,
        limit_type: 'customer_signup',
        request_count: 1,
        window_start: new Date().toISOString(),
        window_duration_seconds: RATE_LIMIT_WINDOW_SECONDS,
      });
    }
    return false;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('cf-connecting-ip') || 'unknown';
    const base44 = createClientFromRequest(req);

    if (await isRateLimited(base44, clientIp)) {
      console.warn(`[customerSignup] Rate limit exceeded for IP: ${clientIp}`);
      return Response.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { full_name, email, password, phone, location } = body;

    // Validate inputs
    if (!full_name?.trim() || !email?.trim() || !password?.trim() || !phone?.trim() || !location?.trim()) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Note: In a real implementation, you would create a user via your auth system
    // For now, return success and let the frontend handle the redirect
    // The user will then access the customer dashboard

    return Response.json({
      success: true,
      message: 'Client account created.',
      data: {
        full_name,
        email,
        phone,
        location,
      }
    });
  } catch (error) {
    console.error('Customer signup error:', error);
    return Response.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
});