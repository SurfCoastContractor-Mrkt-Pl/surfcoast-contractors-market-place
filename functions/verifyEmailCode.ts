import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { code, userEmail } = body;

    if (!code || !userEmail) {
      return Response.json({ error: 'Code and email required' }, { status: 400 });
    }

    // Get stored verification from database
    const verifications = await base44.asServiceRole.entities.EmailVerification.filter({
      email: userEmail,
      verified: false
    });

    if (!verifications || verifications.length === 0) {
      return Response.json({ error: 'No verification code found for this email' }, { status: 400 });
    }

    const verification = verifications[0];

    // Check expiry
    if (new Date() > new Date(verification.expires_at)) {
      await base44.asServiceRole.entities.EmailVerification.delete(verification.id);
      return Response.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Check code
    if (verification.code !== code.toString()) {
      return Response.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Mark as verified
    await base44.asServiceRole.entities.EmailVerification.update(verification.id, {
      verified: true
    });

    return Response.json({ 
      success: true, 
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});