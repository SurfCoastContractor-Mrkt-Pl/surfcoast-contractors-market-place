import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, code } = await req.json();

    if (!email || !code) {
      return Response.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Find verification record
    let records = [];
    try {
      records = await base44.asServiceRole.entities.EmailVerification.filter({ email });
    } catch (dbError) {
      console.error('Error retrieving recovery code:', dbError.message);
      return Response.json({ error: 'Failed to verify code' }, { status: 500 });
    }

    const record = records.find(r => r.code === code && !r.verified);

    if (!record) {
      return Response.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Check expiration
    if (new Date(record.expires_at) < new Date()) {
      return Response.json({ error: 'Code has expired' }, { status: 400 });
    }

    // Mark as verified
    try {
      await base44.asServiceRole.entities.EmailVerification.update(record.id, { verified: true });
    } catch (updateError) {
      console.error('Error marking recovery code as verified:', updateError.message);
      return Response.json({ error: 'Failed to verify code' }, { status: 500 });
    }

    // Create temporary recovery token (valid for 30 minutes) with HMAC signature
    const signingKey = Deno.env.get('ACCOUNT_RECOVERY_SECRET');
    if (!signingKey) {
      console.error('ACCOUNT_RECOVERY_SECRET is not configured');
      return Response.json({ error: 'Account recovery is temporarily unavailable' }, { status: 500 });
    }
    const tokenData = {
      email,
      timestamp: Date.now(),
      type: 'account_recovery'
    };
    const tokenPayload = JSON.stringify(tokenData);
    const encoder = new TextEncoder();
    const data = encoder.encode(tokenPayload);
    const keyData = encoder.encode(signingKey);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, data);
    const signatureHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

    const recoveryToken = btoa(tokenPayload) + '.' + signatureHex;

    return Response.json({ 
      message: 'Code verified successfully',
      recoveryToken,
      email
    });
  } catch (error) {
    console.error('Code verification error:', error.message);
    return Response.json({ 
      error: 'Failed to verify code' 
    }, { status: 500 });
  }
});