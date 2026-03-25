import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth check FIRST — before processing any payload
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { event, data } = body;

    // Validate automation payload
    if (!event?.type || event?.entity_name !== 'ScopeOfWork') {
      return Response.json({ error: 'Invalid automation payload' }, { status: 400 });
    }

    // Only process when scope is marked as closed
    if (event?.type !== 'update' || data?.status !== 'closed') {
      return Response.json({ success: true, message: 'Not a closeout event' });
    }

    const scopeId = event?.entity_id;
    if (!scopeId) {
      return Response.json({ error: 'Missing scope ID' }, { status: 400 });
    }

    // Fetch the complete scope record
    let scope;
    try {
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ id: scopeId });
      scope = scopes?.[0];
    } catch (e) {
      console.error('Error fetching scope:', e.message);
      scope = data;
    }

    if (!scope) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    // Calculate total job cost
    const totalJobCost = scope.cost_type === 'hourly' 
      ? (scope.cost_amount || 0) * (scope.estimated_hours || 0)
      : (scope.cost_amount || 0);

    // Calculate platform fee (default 18%)
    const platformFeePercentage = scope.platform_fee_percentage || 18;
    const platformFeeAmount = (totalJobCost * platformFeePercentage) / 100;
    const contractorPayoutAmount = totalJobCost - platformFeeAmount;

    // Update scope with fee calculations
    await base44.asServiceRole.entities.ScopeOfWork.update(scopeId, {
      platform_fee_percentage: platformFeePercentage,
      platform_fee_amount: platformFeeAmount,
      contractor_payout_amount: contractorPayoutAmount
    });

    console.log(`Platform fee applied to scope ${scopeId}: ${platformFeePercentage}% = $${platformFeeAmount.toFixed(2)}, payout = $${contractorPayoutAmount.toFixed(2)}`);

    return Response.json({
      success: true,
      scopeId,
      totalJobCost: totalJobCost.toFixed(2),
      platformFeePercentage,
      platformFeeAmount: platformFeeAmount.toFixed(2),
      contractorPayoutAmount: contractorPayoutAmount.toFixed(2)
    });
  } catch (error) {
    console.error('Error applying platform fee:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});