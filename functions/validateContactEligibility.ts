import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractor_id } = await req.json();

    if (!contractor_id) {
      return Response.json({ error: 'Contractor ID required' }, { status: 400 });
    }

    // Get contractor profile respecting RLS (only public profiles)
    const contractor = await base44.entities.Contractor.get(contractor_id);
    
    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Demo profiles are now visible to all users - no restriction

    return Response.json({
      eligible: true,
      contractor_id: contractor.id,
      contractor_name: contractor.name
    });
  } catch (error) {
    console.error('Error validating contact eligibility:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});