import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const { recoveryToken } = await req.json();

    if (!recoveryToken) {
      return Response.json({ error: 'Recovery token is required' }, { status: 400 });
    }

    // Decode and validate token
    let tokenData;
    try {
      tokenData = JSON.parse(atob(recoveryToken));
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

    const email = tokenData.email;

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