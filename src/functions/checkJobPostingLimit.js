import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email,
      status: 'active',
    });

    if (subscriptions.length === 0) {
      return Response.json({
        allowed: false,
        reason: 'No active subscription',
      });
    }

    const subscription = subscriptions[0];

    // Calculate jobs posted this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const jobsThisMonth = await base44.asServiceRole.entities.Job.filter({
      poster_email: user.email,
      created_date: { $gte: monthStart.toISOString() },
    });

    // Tier limits
    const limits = {
      starter: 5,
      pro: 15,
      max: Infinity,
      premium: Infinity,
      residential: Infinity,
    };

    const limit = limits[subscription.tier] || 5;
    const canPost = jobsThisMonth.length < limit;

    return Response.json({
      allowed: canPost,
      tier: subscription.tier,
      jobsPostedThisMonth: jobsThisMonth.length,
      limit,
      remaining: limit === Infinity ? Infinity : limit - jobsThisMonth.length,
    });
  } catch (error) {
    console.error('Job posting limit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});