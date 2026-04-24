import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Sends a prominent notification to founding members when their profile is completed.
 * Called via onProfileCompleted automation.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only callable from trusted internal sources (automation chain)
    const serviceKey = req.headers.get('x-internal-key');
    if (!serviceKey || serviceKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      // Also allow admin users as a fallback
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const payload = await req.json();
    const { contractor_email, contractor_name } = payload;

    if (!contractor_email) {
      return Response.json({ error: 'No contractor email provided' }, { status: 400 });
    }

    // Fetch the contractor to verify founding member status
    const contractors = await base44.asServiceRole.entities.Contractor.filter({
      email: contractor_email,
      is_founding_member: true
    });

    if (!contractors || contractors.length === 0) {
      return Response.json({ skipped: true, reason: 'Not a founding member' });
    }

    const contractor = contractors[0];

    // Create an in-app notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      user_email: contractor_email,
      type: 'founding_member_activated',
      title: '🎉 You\'ve Unlocked 1 Year of Premium Access!',
      message: `Welcome to the founding member circle, ${contractor_name}! Your profile is complete. You now have full access to all SurfCoast features for the next 12 months—completely free. Make the most of it!`,
      action_url: '/dashboard',
      action_label: 'Go to Dashboard',
      is_read: false,
      priority: 'high',
      created_at: new Date().toISOString()
    }).catch(() => null);

    // Send welcome email — must use asServiceRole (no user session in automation chain)
    const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
      to: contractor_email,
      subject: '🎉 Welcome to SurfCoast Founding Member Circle!',
      body: `
Hi ${contractor_name},

Your profile is now complete, and you've officially unlocked **1 year of premium all-access** to SurfCoast!

As a founding member, you get:
✓ Full access to all features
✓ Zero subscription fees for 12 months
✓ Priority support
✓ Early access to new tools

Your founding member year begins now and expires on ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}.

Start exploring:
${Deno.env.get('APP_URL')}/dashboard

Welcome aboard!

— The SurfCoast Team
      `
    }).catch(err => {
      console.error('Email send failed:', err.message);
      return null;
    });

    console.log(`Founding member benefit notified for ${contractor_email}:`, {
      notification: !!notification,
      email: !!emailResult
    });

    return Response.json({
      success: true,
      contractor_email,
      notification_created: !!notification,
      email_sent: !!emailResult
    });

  } catch (error) {
    console.error('notifyFoundingMemberBenefit error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});