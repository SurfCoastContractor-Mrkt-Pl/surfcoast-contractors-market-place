import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token } = body;

    // This endpoint uses a token-based auth pattern (public review link)
    // Validate the token exists before proceeding — no user session required
    if (!token) {
      return Response.json({ error: 'Review token is required' }, { status: 400 });
    }

    // Fetch the review request by token
    const requests = await base44.asServiceRole.entities.ReviewEmailRequest.filter({
      review_link_token: token,
    });

    const reviewRequest = requests && requests.length > 0 ? requests[0] : null;

    if (!reviewRequest) {
      return Response.json({ error: 'Invalid review token' }, { status: 404 });
    }

    // Fetch associated scope
    const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({
      id: reviewRequest.scope_id,
    });

    const scope = scopes && scopes.length > 0 ? scopes[0] : null;

    if (!scope) {
      return Response.json({ error: 'Associated job not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      reviewRequest,
      scope,
      jobInfo: {
        jobTitle: scope.job_title,
        contractorName: scope.contractor_name,
        customerName: reviewRequest.customer_name,
        scopeId: scope.id,
      },
    });
  } catch (error) {
    console.error('Error fetching review submission info:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});