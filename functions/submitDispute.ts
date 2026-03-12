import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    
    // Require authentication to prevent spoofing
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      return Response.json({ error: 'Authentication required to file a dispute' }, { status: 401 });
    }
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting: max 3 disputes per user per day
    try {
      const dayAgo = new Date(Date.now() - 86400000).toISOString();
      const recentDisputes = await base44.asServiceRole.entities.Dispute.filter(
        { initiator_email: user.email, submitted_at: { $gte: dayAgo } }
      );
      
      if (recentDisputes && recentDisputes.length >= 3) {
        return Response.json(
          { error: 'Rate limited: Maximum 3 disputes per 24 hours' },
          { status: 429 }
        );
      }
    } catch (limitError) {
      console.warn('Rate limit check failed, proceeding:', limitError.message);
    }

    const body = await req.json();
    const {
      initiator_type,
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

    // Initiator is always the authenticated user (prevent spoofing)
    const finalInitiatorEmail = user.email;
    const finalInitiatorName = user.full_name || 'User';
    const finalInitiatorType = initiator_type || 'customer';

    // Prevent self-disputes
    if (finalInitiatorEmail.toLowerCase() === respondent_email.toLowerCase()) {
      return Response.json({ error: 'Cannot file a dispute against yourself' }, { status: 400 });
    }

    // Validate message length
    if (description.length > 3000) {
      return Response.json({ error: 'Description too long (max 3000 characters)' }, { status: 400 });
    }

    // Generate cryptographically secure dispute number
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);
    const dispute_number = `DSP-${new Date().getFullYear()}-${randomHex.toUpperCase()}`;



    // Create dispute (service role required — RLS restricts user-scoped create)
    const dispute = await base44.asServiceRole.entities.Dispute.create({
      dispute_number,
      initiator_email: finalInitiatorEmail,
      initiator_name: finalInitiatorName,
      initiator_type: finalInitiatorType,
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
          body: `A new dispute has been filed:\n\nDispute #: ${dispute.dispute_number}\nInitiator: ${finalInitiatorName} (${finalInitiatorEmail})\nRespondent: ${respondent_name} (${respondent_email})\nCategory: ${category}\nSeverity: ${severity}\nTitle: ${title}\n\nDescription:\n${description}\n\nPlease review in the Admin Dashboard.`
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
        body: `A dispute has been filed against you.\n\nDispute #: ${dispute.dispute_number}\nFiled by: ${finalInitiatorName}\nCategory: ${category}\n\nPlease log in to your account to respond. This will be reviewed by our admin team.`
      });
    } catch (emailError) {
      console.error('Failed to send respondent notification:', emailError.message);
    }

    console.log(`Dispute ${dispute.dispute_number} created by ${finalInitiatorEmail}`);

    return Response.json({
      success: true,
      dispute_id: dispute.id,
      dispute_number: dispute.dispute_number
    });
  } catch (error) {
    console.error(`[${requestId}] Submit dispute error:`, error.message);
    return Response.json({ error: 'Failed to submit dispute', requestId }, { status: 500 });
  }
});