import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamName, description, defaultRevenueShare = 80 } = await req.json();
    if (!teamName) {
      return Response.json({ error: 'Team name required' }, { status: 400 });
    }

    // Get contractor profile
    const contractors = await base44.entities.Contractor.filter({
      email: user.email,
    });
    if (!contractors?.[0]) {
      return Response.json({ error: 'Contractor profile required' }, { status: 400 });
    }

    const contractor = contractors[0];

    // Create team
    const team = await base44.entities.ContractorTeam.create({
      owner_email: user.email,
      owner_id: contractor.id,
      team_name: teamName,
      description,
      members: [
        {
          contractor_id: contractor.id,
          email: user.email,
          name: contractor.name,
          role: 'owner',
          joined_at: new Date().toISOString(),
          is_active: true,
        },
      ],
      revenue_share: {
        default_percentage: defaultRevenueShare,
        custom_splits: {},
      },
      is_active: true,
    });

    return Response.json({ team });
  } catch (error) {
    console.error('Create team error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});