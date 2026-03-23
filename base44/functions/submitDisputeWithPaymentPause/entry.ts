import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      initiator_type,
      respondent_email,
      respondent_name,
      respondent_type,
      category,
      severity,
      title,
      description,
      evidence_urls,
      scope_id,
      job_id
    } = await req.json();

    // Validate required fields
    if (!initiator_type || !respondent_email || !respondent_name || !category || !title || !description) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create dispute record
    const dispute = await base44.asServiceRole.entities.Dispute.create({
      initiator_email: user.email,
      initiator_name: user.full_name,
      initiator_type,
      respondent_email,
      respondent_name,
      respondent_type,
      scope_id: scope_id || null,
      job_id: job_id || null,
      category,
      severity: severity || 'medium',
      title,
      description,
      evidence_urls: evidence_urls || [],
      status: 'open',
      submitted_at: new Date().toISOString()
    });

    // Pause related progress payments if scope exists
    if (scope_id) {
      const progressPayments = await base44.asServiceRole.entities.ProgressPayment.filter({
        scope_id: scope_id,
        status: { $in: ['pending', 'contractor_completed'] }
      });

      for (const payment of progressPayments || []) {
        await base44.asServiceRole.entities.ProgressPayment.update(payment.id, {
          status: 'pending'
        });
      }
    }

    // Send notification to admin
    const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
    if (adminEmail) {
      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `🚨 New Dispute Filed: ${title} (${severity || 'medium'})`,
        body: `
A new dispute has been filed and requires your attention.

**Dispute Details:**
- Dispute ID: ${dispute.id}
- Category: ${category}
- Severity: ${severity || 'medium'}
- Title: ${title}
- Status: Open

**Parties Involved:**
- Initiator: ${user.full_name} (${initiator_type})
- Respondent: ${respondent_name} (${respondent_type})

**Description:**
${description}

${scope_id ? `- Associated Scope ID: ${scope_id}` : ''}
${job_id ? `- Associated Job ID: ${job_id}` : ''}

**Related Payments:**
All related progress payments have been paused pending resolution.

Please review and take action: [Admin Dashboard Link]

Evidence and additional details are available in the dispute center.
        `.trim()
      });
    }

    return Response.json({
      success: true,
      dispute_id: dispute.id,
      message: 'Dispute submitted successfully. Admin has been notified.'
    });
  } catch (error) {
    console.error('Dispute submission error:', error.message);
    return Response.json(
      { error: 'Failed to submit dispute', details: error.message },
      { status: 500 }
    );
  }
});