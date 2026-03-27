import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const IP_LIMIT_THRESHOLD = 10; // max 10 requests per IP per hour
const EMAIL_LIMIT_THRESHOLD = 3; // max 3 requests per email per hour
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds

async function checkRateLimit(base44, type, key, threshold) {
  try {
    const now = new Date().toISOString();
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();

    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: `recovery_${type}:${key}`,
      window_start: { $gte: windowStart }
    });

    if (records && records.length > 0) {
      const record = records[0];
      if (record.request_count >= threshold) {
        return true;
      }
      await base44.asServiceRole.entities.RateLimitTracker.update(record.id, {
        request_count: record.request_count + 1
      });
    } else {
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key: `recovery_${type}:${key}`,
        limit_type: `recovery_${type}`,
        request_count: 1,
        window_start: now,
        window_duration_seconds: Math.floor(RATE_LIMIT_WINDOW / 1000)
      });
    }
    return false;
  } catch (error) {
    console.warn('[RECOVERY_RATE_LIMIT_ERROR]', error.message);
    return false;
  }
}

Deno.serve(async (req) => {
  const clientIp = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for') || 
                   'unknown';

  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Rate limit: per IP and per email (database-backed)
    if (await checkRateLimit(base44, 'ip', clientIp, IP_LIMIT_THRESHOLD)) {
      console.warn(`[Recovery] IP ${clientIp} exceeded rate limit`);
      return Response.json({ 
        message: 'If this email exists in our system, you will receive recovery instructions.' 
      }, { status: 429 });
    }

    if (await checkRateLimit(base44, 'email', cleanEmail, EMAIL_LIMIT_THRESHOLD)) {
      console.warn(`[Recovery] Email ${cleanEmail} exceeded rate limit`);
      return Response.json({ 
        message: 'If this email exists in our system, you will receive recovery instructions.' 
      }, { status: 429 });
    }

    // Check if email exists as contractor or customer
    const contractors = await base44.asServiceRole.entities.Contractor.filter({ email: cleanEmail });
    const customers = await base44.asServiceRole.entities.CustomerProfile.filter({ email: cleanEmail });

    if (contractors.length === 0 && customers.length === 0) {
      // Don't reveal if email exists (security)
      return Response.json({ 
        message: 'If this email exists in our system, you will receive recovery instructions.' 
      });
    }

    // Log recovery request for security audit
    console.log(`[Recovery] Request from IP ${clientIp} for email ${cleanEmail.substring(0, 3)}***`);


    // Generate 6-digit recovery code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store recovery code
    try {
      await base44.asServiceRole.entities.EmailVerification.create({
        email,
        code,
        expires_at: expiresAt,
        verified: false
      });
    } catch (dbError) {
      console.error('Error creating recovery code:', dbError.message);
      return Response.json({ error: 'Failed to create recovery code' }, { status: 500 });
    }

    // Send recovery email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: cleanEmail,
        subject: 'Account Recovery - Verification Code',
        body: `We received a request to recover your account. Use this code to proceed:\n\n${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`
      });
    } catch (emailError) {
      console.error('[Recovery] Email send failed:', emailError.message);
      return Response.json({ error: 'Failed to send recovery email' }, { status: 500 });
    }

    return Response.json({ 
      message: 'Recovery instructions sent to your email',
      email: cleanEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
    });
  } catch (error) {
    console.error('Account recovery request error:', error.message);
    return Response.json({ 
      error: 'Failed to process recovery request' 
    }, { status: 500 });
  }
});