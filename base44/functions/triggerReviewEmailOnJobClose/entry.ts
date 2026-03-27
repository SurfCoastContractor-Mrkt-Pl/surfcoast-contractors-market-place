import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { v4 as uuidv4 } from 'npm:uuid@9.0.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scope_id } = await req.json();

    if (!scope_id) {
      return Response.json({ error: 'scope_id is required' }, { status: 400 });
    }

    // Fetch scope
    const scopes = await base44.entities.ScopeOfWork.filter({ id: scope_id });
    const scope = scopes && scopes.length > 0 ? scopes[0] : null;

    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    // Only proceed if scope is marked as closed
    if (scope.status !== 'closed') {
      return Response.json(
        { error: 'Scope is not in closed status' },
        { status: 400 }
      );
    }

    // Check if review request already exists
    const existingRequests = await base44.asServiceRole.entities.ReviewEmailRequest.filter({
      scope_id: scope_id,
    });

    if (existingRequests && existingRequests.length > 0) {
      console.log(`Review request already exists for scope ${scope_id}`);
      return Response.json(
        { success: true, message: 'Review request already exists' },
        { status: 200 }
      );
    }

    // Calculate email send time (24 hours from now)
    const closedAt = new Date(scope.closed_date || new Date());
    const emailSendAt = new Date(closedAt.getTime() + 24 * 60 * 60 * 1000);

    // Create review request
    const reviewToken = uuidv4();
    const reviewRequest = await base44.asServiceRole.entities.ReviewEmailRequest.create({
      scope_id: scope_id,
      contractor_email: scope.contractor_email,
      contractor_id: scope.contractor_id,
      customer_email: scope.customer_email,
      customer_name: scope.customer_name,
      job_title: scope.job_title,
      scope_closed_at: scope.closed_date || new Date().toISOString(),
      email_send_at: emailSendAt.toISOString(),
      review_link_token: reviewToken,
      status: 'pending',
    });

    console.log(
      `Review email request automatically created for scope ${scope_id}, scheduled for ${emailSendAt.toISOString()}`
    );

    return Response.json({
      success: true,
      message: 'Review email request created',
      reviewRequest,
      scheduledSendTime: emailSendAt.toISOString(),
    });
  } catch (error) {
    console.error('Error triggering review email:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});