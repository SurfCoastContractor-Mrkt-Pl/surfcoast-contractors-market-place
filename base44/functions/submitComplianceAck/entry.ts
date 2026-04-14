import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { contractor_id } = body;

    if (!contractor_id) {
      return Response.json({ error: 'contractor_id is required' }, { status: 400 });
    }

    // For public apps, use asServiceRole which doesn't require authentication
    const result = await base44.asServiceRole.entities.Contractor.update(contractor_id, {
      compliance_acknowledged: true,
      compliance_acknowledged_at: new Date().toISOString(),
      compliance_version: '1.0-2026-04-14',
    });

    console.log('[submitComplianceAck] Updated contractor:', contractor_id);
    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('[submitComplianceAck] Error:', error);
    return Response.json(
      { error: error.message || 'Failed to submit compliance acknowledgment' },
      { status: 500 }
    );
  }
});