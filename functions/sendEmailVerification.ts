import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Rate limiter for verification code requests
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
const RATE_LIMIT_THRESHOLD = 3; // Max 3 requests per hour per user

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

    // Rate limiting per email
    const now = Date.now();
    if (!requestCounts.has(userEmail)) {
      requestCounts.set(userEmail, []);
    }

    const userRequests = requestCounts.get(userEmail);
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= RATE_LIMIT_THRESHOLD) {
      return Response.json({ error: 'Too many verification requests. Please try again in 1 hour.' }, { status: 429 });
    }

    recentRequests.push(now);
    requestCounts.set(userEmail, recentRequests);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in database with 5 minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    await base44.asServiceRole.entities.EmailVerification.create({
      email: userEmail,
      code: code,
      expires_at: expiresAt,
      verified: false
    });

    // Send email
    const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: 'Your Payment Verification Code',
      body: `Your verification code is: ${code}\n\nThis code will expire in 5 minutes.`
    });

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