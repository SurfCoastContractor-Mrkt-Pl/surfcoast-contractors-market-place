import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractor_id, license_state, license_county } = await req.json();

    // Fetch contractor to verify license state/county
    const contractor = await base44.entities.Contractor.filter({
      id: contractor_id,
      email: user.email
    });

    if (contractor.length === 0) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const c = contractor[0];
    
    // Validate jurisdiction match
    if (c.license_state !== license_state) {
      return Response.json({
        valid: false,
        reason: `Contract is for ${license_state} but your license is in ${c.license_state}`
      });
    }

    // If county-specific, validate county match
    if (license_county && c.license_county && c.license_county !== license_county) {
      return Response.json({
        valid: false,
        reason: `Contract is for ${license_county}, ${license_state} but your license is in ${c.license_county}, ${license_state}`
      });
    }

    return Response.json({ valid: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});