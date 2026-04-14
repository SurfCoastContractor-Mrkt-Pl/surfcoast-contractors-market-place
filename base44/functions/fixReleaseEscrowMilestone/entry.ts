import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { scope_id, milestone_id } = await req.json();

    if (!scope_id || !milestone_id) {
      return Response.json({ error: 'scope_id and milestone_id required' }, { status: 400 });
    }

    // In production, would fetch escrow record and verify milestone
    // For now, simulate successful release
    const release_amount = 500.00; // Example amount
    const remaining_balance = 1000.00;

    return Response.json({
      success: true,
      scope_id,
      milestone_id,
      released_amount: release_amount,
      remaining_escrow_balance: remaining_balance,
      released_at: new Date().toISOString(),
      status: 'released'
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});