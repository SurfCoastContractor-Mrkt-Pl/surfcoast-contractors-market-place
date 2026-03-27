import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scope_id, milestone_id } = await req.json();

    if (!scope_id || !milestone_id) {
      return Response.json(
        { error: 'scope_id and milestone_id are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    // Fetch the scope of work
    const scopes = await base44.entities.ScopeOfWork.filter({ id: scope_id });
    const scope = scopes && scopes.length > 0 ? scopes[0] : null;

    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    // Verify authorization
    const isAuthorized =
      user.email.toLowerCase() === scope.contractor_email?.toLowerCase() ||
      user.role === 'admin';

    if (!isAuthorized) {
      return Response.json(
        { error: 'Unauthorized: you do not have access to this scope' },
        { status: 403 }
      );
    }

    // Fetch the milestone
    const milestones = await base44.entities.ProjectMilestone.filter({
      id: milestone_id,
    });
    const milestone = milestones && milestones.length > 0 ? milestones[0] : null;

    if (!milestone) {
      return Response.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Verify the milestone belongs to this scope
    if (milestone.scope_id !== scope_id) {
      return Response.json(
        { error: 'Milestone does not belong to this scope' },
        { status: 400 }
      );
    }

    // Check if all milestones are now completed
    const allMilestones = await base44.entities.ProjectMilestone.filter({
      scope_id: scope_id,
    });

    const allCompleted =
      allMilestones &&
      allMilestones.length > 0 &&
      allMilestones.every((m) => m.status === 'completed');

    // If all milestones are completed, update scope status to 'review'
    if (allCompleted && allMilestones.length > 0) {
      await base44.entities.ScopeOfWork.update(scope_id, {
        status: 'review',
      });

      console.log(
        `Scope ${scope_id} automatically moved to review status - all milestones completed`
      );
    }

    return Response.json({
      success: true,
      allCompleted,
      scopeStatus: allCompleted ? 'review' : scope.status,
    });
  } catch (error) {
    console.error('Milestone completion error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});