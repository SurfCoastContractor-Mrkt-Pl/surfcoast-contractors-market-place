import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ALLOWED_TRADES = ['plumber', 'hvac', 'electrician', 'concrete', 'drywall', 'painter', 'landscaper'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contractor profile
    const contractors = await base44.entities.Contractor.filter({ email: user.email });
    
    if (!contractors || contractors.length === 0) {
      return Response.json({ hasAccess: false, reason: 'not_a_contractor' }, { status: 200 });
    }

    const contractor = contractors[0];

    // Check if trade specialty is in allowed list
    const tradeSpecialty = contractor.trade_specialty?.toLowerCase() || '';
    const isAllowedTrade = ALLOWED_TRADES.some(trade => tradeSpecialty.includes(trade));

    if (!isAllowedTrade) {
      return Response.json({ hasAccess: false, reason: 'invalid_trade' }, { status: 200 });
    }

    // Check subscription status
    const subscriptions = await base44.entities.ResidentialWaveSubscription.filter({
      contractor_email: user.email,
      status: 'active'
    });

    const hasActiveSubscription = subscriptions && subscriptions.length > 0;

    return Response.json({
      hasAccess: hasActiveSubscription,
      reason: hasActiveSubscription ? 'subscription_active' : 'no_subscription',
      contractor: {
        id: contractor.id,
        email: contractor.email,
        tradeSpecialty: contractor.trade_specialty
      }
    });
  } catch (error) {
    console.error('Access validation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});