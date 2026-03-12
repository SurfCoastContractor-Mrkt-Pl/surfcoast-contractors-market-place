import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scopeId } = await req.json();

    if (!scopeId) {
      return Response.json(
        { error: 'scopeId required' },
        { status: 400 }
      );
    }

    const scope = await base44.entities.ScopeOfWork.filter({ id: scopeId });
    if (!scope || scope.length === 0) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    const scopeData = scope[0];

    // Check if review already exists
    const existingReview = await base44.entities.Review.filter({
      scope_id: scopeId,
      reviewer_email: scopeData.customer_email,
    });

    if (existingReview && existingReview.length > 0) {
      console.log('Review already exists for this scope');
      return Response.json({ success: true, alreadyReviewed: true });
    }

    const emailBody = `
Hi ${scopeData.customer_name},

Don't forget to review your recent job with ${scopeData.contractor_name}!

Your verified review:
✓ Appears on contractor profiles
✓ Helps others find great professionals
✓ Builds trust in our community

[LEAVE A REVIEW NOW]

Job: ${scopeData.job_title}
Completed: 2 days ago

Thanks,
SurfCoast Team
    `;

    await base44.integrations.Core.SendEmail({
      to: scopeData.customer_email,
      subject: `Leave a Review: ${scopeData.contractor_name}`,
      body: emailBody,
      from_name: 'SurfCoast',
    });

    console.log(`✓ Review reminder sent to ${scopeData.customer_email}`);

    return Response.json({
      success: true,
      message: 'Reminder sent',
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});