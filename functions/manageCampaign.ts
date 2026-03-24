import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Manages campaign lifecycle: creates, monitors, and auto-stops campaigns
 * Triggered by admin or scheduled automation
 * Auto-stops when: duration expires OR signup target reached (whichever first)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, campaign_id, campaign_data } = await req.json();

    if (action === 'create') {
      // Create new campaign
      const { name, type, duration_days, target_signups, trial_extension_days, required_profile_completion_percent } = campaign_data;

      if (!name || !type || !duration_days || !target_signups) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const now = new Date();
      const endDate = new Date(now.getTime() + duration_days * 24 * 60 * 60 * 1000);

      const campaign = await base44.asServiceRole.entities.Campaign.create({
        name,
        type,
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        duration_days,
        target_signups,
        current_signups: 0,
        config: {
          trial_extension_days: trial_extension_days || 1,
          required_profile_completion_percent: required_profile_completion_percent || 100
        }
      });

      console.log(`Campaign created: ${name} (ID: ${campaign.id})`);
      return Response.json({ success: true, campaign_id: campaign.id, message: 'Campaign created' });
    }

    if (action === 'check_and_stop') {
      // Check if campaign should be auto-stopped
      if (!campaign_id) {
        return Response.json({ error: 'campaign_id required for check_and_stop' }, { status: 400 });
      }

      const campaigns = await base44.asServiceRole.entities.Campaign.filter({ id: campaign_id });
      if (!campaigns || campaigns.length === 0) {
        return Response.json({ error: 'Campaign not found' }, { status: 404 });
      }

      const campaign = campaigns[0];

      if (campaign.status !== 'active') {
        return Response.json({ message: 'Campaign already ended', status: campaign.status });
      }

      const now = new Date();
      let endReason = null;

      // Check 1: Duration expired?
      if (campaign.end_date && new Date(campaign.end_date) <= now) {
        endReason = 'duration_reached';
      }

      // Check 2: Signup target reached?
      if (campaign.current_signups >= campaign.target_signups) {
        endReason = 'signup_target_reached';
      }

      if (endReason) {
        // Stop campaign
        await base44.asServiceRole.entities.Campaign.update(campaign_id, {
          status: 'ended',
          ended_reason: endReason,
          end_date: now.toISOString()
        });

        console.log(`Campaign ended: ${campaign.name} (${campaign_id}) - Reason: ${endReason} (${campaign.current_signups}/${campaign.target_signups} signups)`);

        return Response.json({
          success: true,
          message: `Campaign auto-stopped: ${endReason}`,
          campaign_id,
          ended_reason: endReason,
          signups: campaign.current_signups,
          target: campaign.target_signups
        });
      }

      return Response.json({
        active: true,
        signups: campaign.current_signups,
        target: campaign.target_signups,
        days_remaining: Math.ceil((new Date(campaign.end_date) - now) / (24 * 60 * 60 * 1000))
      });
    }

    if (action === 'increment_signup') {
      // Increment signup count when referred user completes profile
      if (!campaign_id) {
        return Response.json({ error: 'campaign_id required' }, { status: 400 });
      }

      const campaigns = await base44.asServiceRole.entities.Campaign.filter({ id: campaign_id, status: 'active' });
      if (!campaigns || campaigns.length === 0) {
        return Response.json({ error: 'Active campaign not found' }, { status: 404 });
      }

      const campaign = campaigns[0];
      const newCount = campaign.current_signups + 1;

      await base44.asServiceRole.entities.Campaign.update(campaign_id, {
        current_signups: newCount
      });

      console.log(`Campaign signup incremented: ${campaign.name} (${newCount}/${campaign.target_signups})`);

      return Response.json({
        success: true,
        current_signups: newCount,
        target_signups: campaign.target_signups
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Campaign management error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});