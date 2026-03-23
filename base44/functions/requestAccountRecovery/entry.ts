import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if email exists as contractor or customer
    const contractors = await base44.asServiceRole.entities.Contractor.filter({ email });
    const customers = await base44.asServiceRole.entities.CustomerProfile.filter({ email });

    if (contractors.length === 0 && customers.length === 0) {
      // Don't reveal if email exists (security)
      return Response.json({ 
        message: 'If this email exists in our system, you will receive recovery instructions.' 
      });
    }

    // Rate limit: max 2 recovery requests per email per 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    let recentRequests = [];
    try {
      recentRequests = await base44.asServiceRole.entities.EmailVerification.filter({
        email,
        created_date: { '$gte': thirtyMinsAgo }
      });
    } catch (e) {
      console.error('Error checking rate limit:', e.message);
    }

    // Progressive lockout: block after 2 attempts in 30 mins, then 5 in 24 hours
    if (recentRequests.length >= 2) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      let dailyRequests = [];
      try {
        dailyRequests = await base44.asServiceRole.entities.EmailVerification.filter({
          email,
          created_date: { '$gte': oneDayAgo }
        });
      } catch (e) {
        console.error('Error checking daily rate limit:', e.message);
      }

      if (dailyRequests.length >= 5) {
        return Response.json({ 
          error: 'Too many recovery attempts. Please try again in 24 hours.' 
        }, { status: 429 });
      }

      return Response.json({ 
        error: 'Too many recovery attempts. Please try again in 30 minutes.' 
      }, { status: 429 });
    }

    // Generate 6-digit recovery code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store recovery code
    try {
      await base44.asServiceRole.entities.EmailVerification.create({
        email,
        code,
        expires_at: expiresAt,
        verified: false
      });
    } catch (dbError) {
      console.error('Error creating recovery code:', dbError.message);
      return Response.json({ error: 'Failed to create recovery code' }, { status: 500 });
    }

    // Send recovery email
    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: 'Account Recovery - Verification Code',
        body: `We received a request to recover your account. Use this code to proceed:\n\n${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`
      });
    } catch (emailError) {
      console.error('Error sending recovery email:', emailError.message);
      return Response.json({ error: 'Failed to send recovery email' }, { status: 500 });
    }

    return Response.json({ 
      message: 'Recovery instructions sent to your email',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
    });
  } catch (error) {
    console.error('Account recovery request error:', error.message);
    return Response.json({ 
      error: 'Failed to process recovery request' 
    }, { status: 500 });
  }
});