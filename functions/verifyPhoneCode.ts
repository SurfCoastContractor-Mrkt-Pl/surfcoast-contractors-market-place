import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// In-memory tracking for failed verification attempts
const failedAttempts = new Map();
const FAILED_ATTEMPT_THRESHOLD = 3; // Lock after 3 failed attempts
const LOCKOUT_DURATION = 3600000; // 1 hour lockout

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { phone, code, userEmail } = body;

    if (!phone || !code || !userEmail) {
      return Response.json({ error: 'Phone, code, and email required' }, { status: 400 });
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
      return Response.json({ error: 'Invalid verification code' }, { status: 400 });
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