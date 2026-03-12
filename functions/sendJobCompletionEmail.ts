import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { scopeId, contractorEmail, customerEmail } = await req.json();

    if (!scopeId || !contractorEmail || !customerEmail) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const scope = await base44.entities.ScopeOfWork.filter({ id: scopeId });
    if (!scope || scope.length === 0) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    const scopeData = scope[0];

    // Verify user is either the contractor or customer involved in this scope
    if (user.email !== contractorEmail && user.email !== customerEmail) {
      return Response.json(
        { error: 'Unauthorized - only involved parties can send completion emails' },
        { status: 403 }
      );
    }

    const emailBody = `
Dear ${scopeData.customer_name},

Your project "${scopeData.job_title}" has been completed! 

Contractor: ${scopeData.contractor_name}
Total Cost: $${scopeData.cost_amount}

Please review the work and leave a verified review. Your feedback helps other customers find great professionals.

[LEAVE A REVIEW]

Thanks for using SurfCoast!
    `;

    await base44.integrations.Core.SendEmail({
      to: customerEmail,
      subject: `Job Completed: ${scopeData.job_title}`,
      body: emailBody,
      from_name: 'SurfCoast Marketplace',
    });

    console.log(`✓ Job completion email sent to ${customerEmail}`);

    return Response.json({
      success: true,
      message: 'Email sent',
    });
  } catch (error) {
    console.error('Email error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});