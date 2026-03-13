import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { phone, code, userEmail } = body;

    if (!phone || !code || !userEmail) {
      return Response.json({ error: 'Phone, code, and email required' }, { status: 400 });
    }

    // SECURITY: Database-backed brute-force protection
    const normalizedPhone = phone.replace(/\D/g, '');
    const attemptKey = `phone_verification:${userEmail}:${normalizedPhone}`;
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    
    const recentFailures = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: attemptKey,
      action: 'failed_phone_verification',
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

    // Verify customer profile exists for this email
    const profiles = await base44.asServiceRole.entities.CustomerProfile.filter({
      email: userEmail
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const normalizedPhone = phone.replace(/\D/g, '');

    // Query database for active verification code
    const verifications = await base44.asServiceRole.entities.PhoneVerification.filter({
      email: userEmail,
      phone: normalizedPhone,
      verified: false
    });

    if (!verifications || verifications.length === 0) {
      return Response.json({ error: 'Verification code expired or not sent' }, { status: 400 });
    }

    const verification = verifications[0];

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      await base44.asServiceRole.entities.PhoneVerification.delete(verification.id);
      return Response.json({ error: 'Verification code expired' }, { status: 400 });
    }

    // Verify code matches
    if (verification.code !== code) {
      // Track failed attempt
      if (!failedAttempts.has(lockKey)) {
        failedAttempts.set(lockKey, { count: 0, lockedUntil: 0 });
      }
      const attempt = failedAttempts.get(lockKey);
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
    if (failedAttempts.has(lockKey)) {
      failedAttempts.delete(lockKey);
    }

    // Code is valid, mark as verified
    await base44.asServiceRole.entities.PhoneVerification.update(verification.id, {
      verified: true
    });

    return Response.json({ success: true, message: 'Phone verified successfully' });
  } catch (error) {
    console.error('Phone verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});