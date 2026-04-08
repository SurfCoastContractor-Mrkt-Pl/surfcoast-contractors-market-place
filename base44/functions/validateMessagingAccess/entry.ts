import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contractorEmail, clientEmail } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contractor's subscription tier
    const contractors = await base44.entities.Contractor.filter({
      email: contractorEmail
    });

    if (!contractors || contractors.length === 0) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const contractor = contractors[0];
    const subscriptionTier = contractor.profile_tier || 'standard';

    // Premium: free messaging with ALL clients
    if (subscriptionTier === 'premium') {
      return Response.json({
        allowed: true,
        reason: 'WAVE OS Premium includes free messaging with all clients'
      });
    }

    // Max: free messaging with past clients only
    if (subscriptionTier === 'max') {
      const completedScopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: contractorEmail,
        client_email: clientEmail,
        status: 'closed'
      });

      const isPastClient = completedScopes && completedScopes.length > 0;

      return Response.json({
        allowed: isPastClient,
        reason: isPastClient
          ? 'Past client — free messaging included with WAVE OS Max'
          : 'Free messaging is available with past clients only on WAVE OS Max. Upgrade to Premium for all clients.'
      });
    }

    // All other tiers: paid access required
    return Response.json({
      allowed: false,
      reason: 'Direct messaging requires payment ($1.50/session or $50/mo subscription)'
    });
  } catch (error) {
    console.error('Error validating messaging access:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});