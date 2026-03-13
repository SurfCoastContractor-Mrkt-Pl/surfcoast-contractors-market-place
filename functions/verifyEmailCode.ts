import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { code, userEmail } = body;

    if (!code || !userEmail) {
      return Response.json({ error: 'Code and email required' }, { status: 400 });
    }

    // SECURITY: Database-backed brute-force protection
    const attemptKey = `email_verification:${userEmail}`;
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const recentFailures = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: attemptKey,
      action: 'failed_email_verification',
      created_date: { $gte: oneHourAgo }
    });
    
    const FAILED_ATTEMPT_THRESHOLD = 3;
    if (recentFailures && recentFailures.length >= FAILED_ATTEMPT_THRESHOLD) {
      return Response.json({ 
        error: 'Account locked due to multiple failed attempts. Try again in 1 hour.' 
      }, { status: 429 });
    }

    // If authenticated, ensure userEmail matches the session
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user.email.toLowerCase() !== userEmail.toLowerCase()) {
        return Response.json({ error: 'Forbidden: email does not match authenticated user' }, { status: 403 });
      }
    }

    // Get stored verification from database
    let verifications;
    try {
      verifications = await base44.asServiceRole.entities.EmailVerification.filter({
        email: userEmail,
        verified: false
      });
    } catch (dbError) {
      console.error('Database error retrieving verification:', dbError.message);
      return Response.json({ error: 'Failed to retrieve verification code' }, { status: 500 });
    }

    if (!verifications || verifications.length === 0) {
      return Response.json({ error: 'No verification code found for this email' }, { status: 400 });
    }

    const verification = verifications[0];

    // Check expiry
    if (new Date() > new Date(verification.expires_at)) {
      try {
        await base44.asServiceRole.entities.EmailVerification.delete(verification.id);
      } catch (e) {
        console.error('Error deleting expired verification:', e.message);
      }
      return Response.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Check code
    if (verification.code !== code.toString()) {
      // Track failed attempt
      if (!failedAttempts.has(userEmail)) {
        failedAttempts.set(userEmail, { count: 0, lockedUntil: 0 });
      }
      const attempt = failedAttempts.get(userEmail);
      attempt.count += 1;

      // Lock account after threshold
      if (attempt.count >= FAILED_ATTEMPT_THRESHOLD) {
        attempt.lockedUntil = now + LOCKOUT_DURATION;
        return Response.json({ 
          error: 'Account locked due to multiple failed attempts. Please try again in 1 hour.' 
        }, { status: 429 });
      }

      const remainingAttempts = FAILED_ATTEMPT_THRESHOLD - attempt.count;
      return Response.json({ 
        error: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
      }, { status: 400 });
    }

    // Clear failed attempts on success
    if (failedAttempts.has(userEmail)) {
      failedAttempts.delete(userEmail);
    }

    // Mark as verified
    try {
      await base44.asServiceRole.entities.EmailVerification.update(verification.id, {
        verified: true
      });
    } catch (updateError) {
      console.error('Error marking verification as verified:', updateError.message);
      return Response.json({ error: 'Failed to verify code' }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});