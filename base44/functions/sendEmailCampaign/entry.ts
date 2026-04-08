import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated admin — bulk email is admin-only
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { campaignId } = await req.json();

    if (!campaignId) {
      return Response.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // Get campaign
    const campaigns = await base44.entities.EmailCampaign.filter({ id: campaignId });
    if (!campaigns?.[0]) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaign = campaigns[0];

    // Get recipients based on audience
    let recipients = [];

    if (campaign.target_audience === 'contractors') {
      const contractors = await base44.entities.Contractor.list();
      recipients = contractors.map(c => c.email);
    } else if (campaign.target_audience === 'clients') {
      const customers = await base44.entities.CustomerProfile.list();
      recipients = customers.map(c => c.email);
    } else {
      const contractors = await base44.entities.Contractor.list();
      const customers = await base44.entities.CustomerProfile.list();
      recipients = [...contractors.map(c => c.email), ...customers.map(c => c.email)];
    }

    // Apply segmentation filter if any
    if (campaign.segment_filter) {
      // In production, apply more sophisticated filtering
    }

    // Send emails
    let sent = 0;
    for (const email of recipients) {
      try {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: campaign.subject,
          body: campaign.body_html,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err);
      }
    }

    // Update campaign
    await base44.entities.EmailCampaign.update(campaignId, {
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipient_count: sent,
    });

    return Response.json({
      success: true,
      sent,
      campaign,
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});