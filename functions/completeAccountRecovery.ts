import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const { recoveryToken } = await req.json();

    if (!recoveryToken) {
      return Response.json({ error: 'Recovery token is required' }, { status: 400 });
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
        return Response.json({ error: 'Recovery service unavailable' }, { status: 500 });
      }
      const encoder = new TextEncoder();
      const data = encoder.encode(tokenPayload);
      const keyData = encoder.encode(signingKey);
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      const signatureBytes = new Uint8Array(signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, data);

      if (!isValid) {
        return Response.json({ error: 'Invalid recovery token' }, { status: 400 });
      }
    } catch {
      return Response.json({ error: 'Invalid recovery token' }, { status: 400 });
    }

    // Check token type and expiration (30 minutes)
    if (tokenData.type !== 'account_recovery') {
      return Response.json({ error: 'Invalid token type' }, { status: 400 });
    }

    if (Date.now() - tokenData.timestamp > 30 * 60 * 1000) {
      return Response.json({ error: 'Recovery token expired' }, { status: 400 });
    }

    email = tokenData.email;

    // Check if user exists
    const contractors = await base44.asServiceRole.entities.Contractor.filter({ email });
    const customers = await base44.asServiceRole.entities.CustomerProfile.filter({ email });

    if (contractors.length === 0 && customers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Send login link or password reset link
    const resetLink = `${req.headers.get('origin')}/reset-password?token=${encodeURIComponent(recoveryToken)}`;
    
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Complete Your Account Recovery',
      body: `Click the link below to regain access to your account:\n\n${resetLink}\n\nThis link expires in 30 minutes.\n\nIf you didn't request this, ignore this email.`
    });

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