import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated user
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { contractor_id } = body;

    if (!contractor_id) {
      return Response.json({ error: 'contractor_id is required' }, { status: 400 });
    }

    // Verify the authenticated user owns this contractor record
    const contractor = await base44.asServiceRole.entities.Contractor.get(contractor_id);
    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }
    if (contractor.email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: you can only acknowledge compliance for your own account' }, { status: 403 });
    }

    const result = await base44.asServiceRole.entities.Contractor.update(contractor_id, {
      compliance_acknowledged: true,
      compliance_acknowledged_at: new Date().toISOString(),
      compliance_version: '1.0-2026-04-14',
    });

    console.log('[submitComplianceAck] Updated contractor:', contractor_id, 'by', user.email);
    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('[submitComplianceAck] Error:', error);
    return Response.json(
      { error: error.message || 'Failed to submit compliance acknowledgment' },
      { status: 500 }
    );
  }
});