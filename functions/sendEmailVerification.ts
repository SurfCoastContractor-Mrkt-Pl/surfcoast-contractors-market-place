import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { userEmail } = body;

    if (!userEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

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
    const emailResult = await base44.integrations.Core.SendEmail({
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