import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const clientIp = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for') || 
                   'unknown';
  const base44 = createClientFromRequest(req);

  try {
    const { recoveryToken } = await req.json();

    if (!recoveryToken || typeof recoveryToken !== 'string') {
      return Response.json({ error: 'Recovery token is required' }, { status: 400 });
    }

    // Validate token format before parsing
    if (recoveryToken.length > 10000) {
      console.warn(`[Recovery] Oversized token from IP ${clientIp}`);
      return Response.json({ error: 'Invalid recovery token' }, { status: 400 });
    }

    // Decode and validate token with HMAC signature
    let tokenData;
    let email;
    try {
      const [encodedPayload, signature] = recoveryToken.split('.');
      if (!encodedPayload || !signature) {
        return Response.json({ error: 'Invalid recovery token' }, { status: 400 });
      }

      const tokenPayload = atob(encodedPayload);
      tokenData = JSON.parse(tokenPayload);

      // Verify HMAC signature
      const signingKey = Deno.env.get('ACCOUNT_RECOVERY_SECRET');
      if (!signingKey) {
        console.error('ACCOUNT_RECOVERY_SECRET is not configured');
        return Response.json({ error: 'Account recovery is temporarily unavailable' }, { status: 500 });
      }
      const encoder = new TextEncoder();
      const data = encoder.encode(tokenPayload);
      const keyData = encoder.encode(signingKey);
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      const signatureBytes = new Uint8Array(signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, data);

      if (!isValid) {
        console.warn(`[Recovery] Invalid HMAC from IP ${clientIp}`);
        return Response.json({ error: 'Invalid recovery token' }, { status: 400 });
      }
    } catch (e) {
      console.warn(`[Recovery] Token parse error from IP ${clientIp}: ${e.message}`);
      return Response.json({ error: 'Invalid recovery token' }, { status: 400 });
    }

    // Check token type and expiration (30 minutes)
    if (tokenData.type !== 'account_recovery') {
      return Response.json({ error: 'Invalid token type' }, { status: 400 });
    }

    if (Date.now() - tokenData.timestamp > 30 * 60 * 1000) {
      return Response.json({ error: 'Recovery token expired' }, { status: 400 });
    }

    email = tokenData.email?.toLowerCase().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email in token' }, { status: 400 });
    }

    // Check if user exists
    const contractors = await base44.asServiceRole.entities.Contractor.filter({ email });
    const customers = await base44.asServiceRole.entities.CustomerProfile.filter({ email });

    if (contractors.length === 0 && customers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Send login link or password reset link
    const origin = req.headers.get('origin') || 'https://app.example.com';
    const resetLink = `${origin}/reset-password?token=${encodeURIComponent(recoveryToken)}`;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: 'Complete Your Account Recovery',
        body: `Click the link below to regain access to your account:\n\n${resetLink}\n\nThis link expires in 30 minutes.\n\nIf you didn't request this, ignore this email.`
      });
    } catch (emailError) {
      console.error('[Recovery] Final email send failed:', emailError.message);
      return Response.json({ error: 'Failed to send recovery link' }, { status: 500 });
    }

    console.log(`[Recovery] Completed for ${email.substring(0, 3)}*** from IP ${clientIp}`);
    return Response.json({ 
      message: 'Final recovery instructions sent to your email'
    });
  } catch (error) {
    console.error('Account recovery completion error:', error.message);
    return Response.json({ 
      error: 'Failed to complete recovery process' 
    }, { status: 500 });
  }
});