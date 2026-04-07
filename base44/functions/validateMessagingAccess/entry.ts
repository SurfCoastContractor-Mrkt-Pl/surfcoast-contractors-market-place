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

    // Residential Bundle: unlimited access
    if (subscriptionTier === 'premium_residential') {
      return Response.json({
        allowed: true,
        reason: 'Residential Bundle includes unlimited messaging'
      });
    }

    // Premium: only with past clients
    if (subscriptionTier === 'premium') {
      const completedScopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: contractorEmail,
        client_email: clientEmail,
        status: 'closed'
      });

      const isPastClient = completedScopes && completedScopes.length > 0;

      return Response.json({
        allowed: isPastClient,
        reason: isPastClient
          ? 'Past client eligible for free messaging'
          : 'Premium messaging restricted to past clients only'
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