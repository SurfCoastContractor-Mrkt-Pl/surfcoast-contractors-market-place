import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user before allowing email sends
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { senderEmail, recipientEmail, referralCode } = await req.json();

    // Validate required fields
    if (!senderEmail || !recipientEmail || !referralCode) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify sender matches authenticated user (prevent impersonation)
    if (senderEmail !== user.email) {
      return Response.json({ error: 'Unauthorized: Cannot send referrals as another user' }, { status: 403 });
    }

    // Rate limiting: max 10 referral emails per hour per user
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const now = new Date();
    const windowStart = new Date(now.getTime() - 3600000);

    const rateLimitEntries = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: user.email,
      limit_type: 'referral_email',
      window_start: { $gte: windowStart.toISOString() }
    });

    if (rateLimitEntries?.length > 0) {
      const tracker = rateLimitEntries[0];
      if (tracker.request_count >= 10) {
        return Response.json({ 
          success: false, 
          error: 'Too many referral emails sent. Please try again later.' 
        }, { status: 429 });
      }
      await base44.asServiceRole.entities.RateLimitTracker.update(tracker.id, {
        request_count: tracker.request_count + 1
      });
    } else {
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key: user.email,
        limit_type: 'referral_email',
        request_count: 1,
        window_start: now.toISOString(),
        window_duration_seconds: 3600
      });
    }

    // Get app base URL
    const appBaseUrl = Deno.env.get('BASE44_APP_ID') 
      ? `https://${Deno.env.get('BASE44_APP_ID')}.base44.app`
      : 'https://surfcoast.app';

    const referralLink = `${appBaseUrl}/ReferralSignup?ref=${referralCode}`;

    // Send email via Core integration
    const response = await base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `${senderEmail} has invited you to SurfCoast`,
      body: `
Hi there,

${senderEmail} thinks you'd be a great fit for SurfCoast Marketplace!

SurfCoast connects exceptional professionals with clients who need their skills. Whether you're a contractor looking for work or a customer seeking quality services, we've got you covered.

Join using this link and get started with a free trial:
${referralLink}

Here's what you get:
• Browse quality contractors or find your next project
• Secure payments and direct communication
• Free trial to explore and verify everything works for you
• Plus, both you and ${senderEmail} get bonus trial days when you complete your first transaction

See you on the other side!

Best regards,
The SurfCoast Team

---
Click here to join: ${referralLink}
      `
    });

    return Response.json({ 
      success: true, 
      message: 'Referral link sent successfully',
      recipientEmail 
    });
  } catch (error) {
    console.error('Error sending referral link:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});