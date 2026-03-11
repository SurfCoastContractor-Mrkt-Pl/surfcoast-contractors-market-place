import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
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

    // Rate limit: max 3 recovery requests per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentRequests = await base44.asServiceRole.entities.EmailVerification.filter({
      email,
      created_date: { '$gte': oneHourAgo }
    });

    if (recentRequests.length >= 3) {
      return Response.json({ 
        error: 'Too many recovery attempts. Please try again in an hour.' 
      }, { status: 429 });
    }

    // Generate 6-digit recovery code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store recovery code
    await base44.asServiceRole.entities.EmailVerification.create({
      email,
      code,
      expires_at: expiresAt,
      verified: false
    });

    // Send recovery email
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Account Recovery - Verification Code',
      body: `We received a request to recover your account. Use this code to proceed:\n\n${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`
    });

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