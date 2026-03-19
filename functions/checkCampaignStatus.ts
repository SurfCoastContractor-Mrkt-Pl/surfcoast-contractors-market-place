import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Scheduled automation that runs every 6 hours to check and auto-stop expired campaigns
 * Called internally via INTERNAL_SERVICE_KEY
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only allow admin users or internal service calls (scheduled automation)
    const internalKey = req.headers.get('x-internal-service-key');
    const isValidInternalCall = internalKey && internalKey === Deno.env.get('INTERNAL_SERVICE_KEY');

    if (!isValidInternalCall) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: admin or internal access only' }, { status: 403 });
      }
    }

    // Find all active campaigns
    const campaigns = await base44.asServiceRole.entities.Campaign.filter({
      status: 'active'
    });

    if (!campaigns || campaigns.length === 0) {
      return Response.json({ checked: 0, stopped: 0 });
    }

    const now = new Date();
    let stoppedCount = 0;

    for (const campaign of campaigns) {
      let shouldStop = false;
      let stopReason = null;

      // Check 1: Duration expired?
      if (campaign.end_date && new Date(campaign.end_date) <= now) {
        shouldStop = true;
        stopReason = 'duration_reached';
      }

      // Check 2: Signup target reached?
      if (campaign.current_signups >= campaign.target_signups) {
        shouldStop = true;
        stopReason = 'signup_target_reached';
      }

      if (shouldStop) {
        try {
          await base44.asServiceRole.entities.Campaign.update(campaign.id, {
            status: 'ended',
            ended_reason: stopReason,
            end_date: now.toISOString()
          });

          stoppedCount++;
          console.log(`[Campaign Auto-Stop] ${campaign.name} ended - ${stopReason} (${campaign.current_signups}/${campaign.target_signups} signups)`);
        } catch (e) {
          console.error(`Error stopping campaign ${campaign.id}:`, e.message);
        }
      }
    }

    return Response.json({
      checked: campaigns.length,
      stopped: stoppedCount,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Campaign status check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});