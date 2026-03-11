import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Rate limiter for verification code requests
const requestCounts = new Map();
const failedAttempts = new Map();
const SHORT_WINDOW = 300000; // 5 minutes
const LONG_WINDOW = 3600000; // 1 hour
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

    // Rate limiting per email with progressive lockout
     const now = Date.now();
     if (!requestCounts.has(userEmail)) {
       requestCounts.set(userEmail, []);
     }

     const userRequests = requestCounts.get(userEmail);
     const shortWindowRequests = userRequests.filter(timestamp => now - timestamp < SHORT_WINDOW);
     const longWindowRequests = userRequests.filter(timestamp => now - timestamp < LONG_WINDOW);

     // Check short-window rate limit (2 requests per 5 minutes)
     if (shortWindowRequests.length >= SHORT_THRESHOLD) {
       return Response.json({ error: 'Too many verification requests. Please try again in 5 minutes.' }, { status: 429 });
     }

     // Check long-window rate limit (5 requests per hour)
     if (longWindowRequests.length >= LONG_THRESHOLD) {
       return Response.json({ error: 'Too many verification requests. Please try again in 1 hour.' }, { status: 429 });
     }

     // Check failed verification attempts
     if (!failedAttempts.has(userEmail)) {
       failedAttempts.set(userEmail, []);
     }
     const failedAttemptsList = failedAttempts.get(userEmail);
     const recentFailures = failedAttemptsList.filter(timestamp => now - timestamp < LONG_WINDOW);

     if (recentFailures.length >= FAILED_ATTEMPT_THRESHOLD) {
       return Response.json({ error: 'Account temporarily locked due to multiple failed verification attempts. Please try again in 1 hour.' }, { status: 429 });
     }

     longWindowRequests.push(now);
     requestCounts.set(userEmail, longWindowRequests);

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