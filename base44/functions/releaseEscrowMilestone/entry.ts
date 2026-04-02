import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { milestoneId, scopeId } = await req.json();
    if (!milestoneId || !scopeId) {
      return Response.json({ error: 'Milestone ID and Scope ID required' }, { status: 400 });
    }

    // Get milestone
    const milestones = await base44.entities.EscrowMilestone.filter({ id: milestoneId });
    if (!milestones?.[0]) {
      return Response.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const milestone = milestones[0];

    // Get scope to verify authorization
    const scopes = await base44.entities.ScopeOfWork.filter({ id: scopeId });
    if (!scopes?.[0]) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    const scope = scopes[0];

    // Verify user is client
    if (scope.client_email !== user.email) {
      return Response.json({ error: 'Not authorized to approve' }, { status: 403 });
    }

    // Release funds
    await base44.entities.EscrowMilestone.update(milestoneId, {
      status: 'paid',
      client_approval_at: new Date().toISOString(),
      payment_released_at: new Date().toISOString(),
    });

    // In production, would trigger Stripe payout to contractor

    return Response.json({
      success: true,
      message: `Released $${milestone.amount} from escrow`,
      milestone,
    });
  } catch (error) {
    console.error('Release escrow error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});