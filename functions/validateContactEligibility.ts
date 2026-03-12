import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contractor_id } = await req.json();

    if (!contractor_id) {
      return Response.json({ error: 'Contractor ID required' }, { status: 400 });
    }

    // Get contractor profile
    const contractor = await base44.asServiceRole.entities.Contractor.get(contractor_id);
    
    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Check if this is a demo profile
    if (contractor.is_demo) {
      return Response.json({
        eligible: false,
        reason: 'incomplete_profile',
        message: 'This profile is still being set up and is not yet accepting inquiries. Please try another contractor.',
        contractor_name: contractor.name
      }, { status: 403 });
    }

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