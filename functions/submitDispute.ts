import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Require authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      respondent_email,
      respondent_name,
      respondent_type,
      scope_id,
      job_id,
      job_title,
      category,
      severity,
      title,
      description,
      evidence_urls = []
    } = body;

    // Validate required fields
    if (!respondent_email || !respondent_name || !respondent_type || !category || !title || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent self-disputes
    if (user.email.toLowerCase() === respondent_email.toLowerCase()) {
      return Response.json({ error: 'Cannot file a dispute against yourself' }, { status: 400 });
    }

    // Validate message length
    if (description.length > 3000) {
      return Response.json({ error: 'Description too long (max 3000 characters)' }, { status: 400 });
    }

    // Generate dispute number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const dispute_number = `DSP-${new Date().getFullYear()}-${String(random).padStart(5, '0')}`;

    // Determine initiator type
    const initiatorTypes = {
      'contractor': 'customer',
      'customer': 'contractor'
    };
    const initiator_type = initiatorTypes[respondent_type] || respondent_type;

    // Create dispute
    const dispute = await base44.asServiceRole.entities.Dispute.create({
      dispute_number,
      initiator_email: user.email,
      initiator_name: user.full_name || 'User',
      initiator_type,
      respondent_email,
      respondent_name,
      respondent_type,
      scope_id: scope_id || null,
      job_id: job_id || null,
      job_title: job_title || null,
      category,
      severity,
      title,
      description,
      evidence_urls,
      status: 'open',
      submitted_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString()
    });

    // Send notification emails
    const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
    if (adminEmail) {
      try {
        await base44.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `[DISPUTE] New dispute filed: ${dispute.dispute_number}`,
          body: `A new dispute has been filed:\n\nDispute #: ${dispute.dispute_number}\nInitiator: ${user.full_name} (${user.email})\nRespondent: ${respondent_name} (${respondent_email})\nCategory: ${category}\nSeverity: ${severity}\nTitle: ${title}\n\nDescription:\n${description}\n\nPlease review in the Admin Dashboard.`
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError.message);
      }
    }

    // Notify respondent
    try {
      await base44.integrations.Core.SendEmail({
        to: respondent_email,
        subject: `Dispute filed against you: ${dispute.dispute_number}`,
        body: `A dispute has been filed against you.\n\nDispute #: ${dispute.dispute_number}\nFiled by: ${user.full_name}\nCategory: ${category}\n\nPlease log in to your account to respond. This will be reviewed by our admin team.`
      });
    } catch (emailError) {
      console.error('Failed to send respondent notification:', emailError.message);
    }

    console.log(`Dispute ${dispute.dispute_number} created by ${user.email}`);

    return Response.json({
      success: true,
      dispute_id: dispute.id,
      dispute_number: dispute.dispute_number
    });
  } catch (error) {
    console.error('Submit dispute error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});