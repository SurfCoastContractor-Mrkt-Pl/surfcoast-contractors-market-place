import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all pending review requests that are due to be sent
    const now = new Date().toISOString();
    const pendingRequests = await base44.asServiceRole.entities.ReviewEmailRequest.filter({
      status: 'pending',
    });

    const requestsDue = pendingRequests.filter(
      (r) => r.email_send_at <= now
    );

    console.log(`Found ${requestsDue.length} review emails to send`);

    let successCount = 0;
    let failureCount = 0;

    for (const request of requestsDue) {
      try {
        // Generate review link
        const reviewPageUrl = `${Deno.env.get('APP_URL')}/review-submission?token=${request.review_link_token}`;

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: request.customer_email,
          subject: `We'd love your feedback on ${request.job_title}`,
          body: `Hi ${request.customer_name},

Thank you for choosing ${request.contractor_name || 'our contractor'} for your recent project. We hope you're satisfied with the work!

Your feedback is important to us and helps maintain quality standards on our platform. Please take a moment to share your experience.

Submit your review here: ${reviewPageUrl}

The review process takes just 2-3 minutes and includes:
- Overall rating (1-5 stars)
- Quality of work
- Timeliness
- Communication
- Professional appearance

Thank you for being a valued customer!

Best regards,
SurfCoast Contractor Marketplace`,
        });

        // Update request as sent
        await base44.asServiceRole.entities.ReviewEmailRequest.update(request.id, {
          status: 'sent',
          email_sent_at: new Date().toISOString(),
        });

        successCount++;
        console.log(`Review email sent for scope ${request.scope_id}`);
      } catch (error) {
        failureCount++;
        console.error(`Failed to send review email for scope ${request.scope_id}:`, error.message);

        // Update request as failed
        await base44.asServiceRole.entities.ReviewEmailRequest.update(request.id, {
          status: 'failed',
          error_message: error.message,
        });
      }
    }

    return Response.json({
      success: true,
      totalProcessed: requestsDue.length,
      successCount,
      failureCount,
    });
  } catch (error) {
    console.error('Scheduled review email error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});