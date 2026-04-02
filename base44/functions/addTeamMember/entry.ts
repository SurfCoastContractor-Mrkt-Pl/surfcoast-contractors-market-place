import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, memberEmail, role = 'member', revenueSplitPercent } = await req.json();

    if (!teamId || !memberEmail) {
      return Response.json({ error: 'Team ID and member email required' }, { status: 400 });
    }

    // Verify ownership
    const team = await base44.entities.ContractorTeam.filter({ id: teamId });
    if (!team?.[0] || team[0].owner_email !== user.email) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get member contractor profile
    const memberContractors = await base44.entities.Contractor.filter({
      email: memberEmail,
    });
    if (!memberContractors?.[0]) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const member = memberContractors[0];
    const updatedTeam = team[0];

    updatedTeam.members.push({
      contractor_id: member.id,
      email: memberEmail,
      name: member.name,
      role,
      joined_at: new Date().toISOString(),
      is_active: true,
    });

    if (revenueSplitPercent) {
      updatedTeam.revenue_share.custom_splits[member.id] = revenueSplitPercent;
    }

    await base44.entities.ContractorTeam.update(teamId, updatedTeam);

    return Response.json({ success: true, team: updatedTeam });
  } catch (error) {
    console.error('Add team member error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});