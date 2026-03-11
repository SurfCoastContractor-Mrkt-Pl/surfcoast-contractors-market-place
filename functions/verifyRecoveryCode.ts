import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
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

    // Create temporary recovery token (valid for 30 minutes)
    const recoveryToken = btoa(JSON.stringify({
      email,
      timestamp: Date.now(),
      type: 'account_recovery'
    }));

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