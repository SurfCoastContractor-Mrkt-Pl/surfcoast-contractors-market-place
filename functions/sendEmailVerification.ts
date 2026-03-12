import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SHORT_WINDOW = 300; // 5 minutes in seconds
const LONG_WINDOW = 3600; // 1 hour in seconds
const SHORT_THRESHOLD = 2; // Max 2 requests per 5 minutes
const LONG_THRESHOLD = 5; // Max 5 requests per hour
const FAILED_ATTEMPT_THRESHOLD = 3; // Lock after 3 failed verification attempts

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    
    const userEmail = body?.userEmail || body?.email;

    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
      return Response.json({ error: 'Valid email required' }, { status: 400 });
    }

    // For unauthenticated requests, this is allowed (public app)
    // For authenticated requests, ensure email matches
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      try {
        const user = await base44.auth.me();
        if (user.email.toLowerCase() !== userEmail.toLowerCase()) {
          return Response.json({ error: 'Forbidden: email does not match authenticated user' }, { status: 403 });
        }
      } catch {
        // If auth fails, allow unauthenticated flow
      }
    }

    // Database-backed rate limiting
    const now = new Date();
    const shortWindowStart = new Date(now.getTime() - SHORT_WINDOW * 1000);
    const longWindowStart = new Date(now.getTime() - LONG_WINDOW * 1000);

    try {
      // Check short-window requests (5 minutes)
      const shortWindowRecords = await base44.asServiceRole.entities.RateLimitTracker.filter({
        key: userEmail,
        limit_type: 'email_verification',
        window_start: { '$gte': shortWindowStart.toISOString() }
      });

      if (shortWindowRecords.length > 0 && shortWindowRecords[0].request_count >= SHORT_THRESHOLD) {
        return Response.json({ error: 'Too many verification requests. Please try again in 5 minutes.' }, { status: 429 });
      }

      // Check long-window requests (1 hour)
      const longWindowRecords = await base44.asServiceRole.entities.RateLimitTracker.filter({
        key: userEmail,
        limit_type: 'email_verification',
        window_start: { '$gte': longWindowStart.toISOString() }
      });

      if (longWindowRecords.length > 0 && longWindowRecords[0].request_count >= LONG_THRESHOLD) {
        return Response.json({ error: 'Too many verification requests. Please try again in 1 hour.' }, { status: 429 });
      }

      // Update or create rate limit record
      if (longWindowRecords.length > 0) {
        await base44.asServiceRole.entities.RateLimitTracker.update(longWindowRecords[0].id, {
          request_count: longWindowRecords[0].request_count + 1
        });
      } else {
        await base44.asServiceRole.entities.RateLimitTracker.create({
          key: userEmail,
          limit_type: 'email_verification',
          request_count: 1,
          window_start: now.toISOString(),
          window_duration_seconds: LONG_WINDOW
        });
      }
    } catch (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError.message);
      // Fail open if database unavailable
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in database with 5 minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    try {
      await base44.asServiceRole.entities.EmailVerification.create({
        email: userEmail,
        code: code,
        expires_at: expiresAt,
        verified: false
      });
    } catch (dbError) {
      console.error('Database error creating verification record:', dbError.message);
      return Response.json({ error: 'Failed to create verification code' }, { status: 500 });
    }

    // Send email
    let emailResult;
    try {
      emailResult = await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: 'Your Payment Verification Code',
        body: `Your verification code is: ${code}\n\nThis code will expire in 5 minutes.`
      });
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
      return Response.json({ error: 'Failed to send verification code' }, { status: 500 });
    }

    if (!emailResult) {
      console.error('Failed to send verification email to', userEmail);
      return Response.json({ error: 'Failed to send verification code' }, { status: 500 });
    }

    console.log(`Verification code sent via email to ${userEmail}`);

    return Response.json({ 
      success: true, 
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});