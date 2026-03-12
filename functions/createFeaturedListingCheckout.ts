import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = await import('npm:stripe@16.0.0').then(m => new m.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    const { contractorId, contractorEmail } = await req.json();

    if (!contractorId || !contractorEmail) {
      console.warn(`[${requestId}] Missing required fields`);
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify authenticated user matches the contractor email
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      console.warn(`[${requestId}] Unauthenticated checkout attempt for ${contractorEmail}`);
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await base44.auth.me();
    if (!user || user.email !== contractorEmail) {
      console.warn(`[${requestId}] Unauthorized: user ${user?.email} attempting to create checkout for ${contractorEmail}`);
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify the contractor profile exists and matches the authenticated user
    const contractors = await base44.entities.Contractor.filter({ 
      email: contractorEmail,
      id: contractorId
    });

    if (!contractors || contractors.length === 0) {
      console.warn(`[${requestId}] Contractor not found: ${contractorId} for email ${contractorEmail}`);
      return Response.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    if (contractors[0].id !== contractorId) {
      console.warn(`[${requestId}] Contractor ID mismatch for ${contractorEmail}`);
      return Response.json({ error: 'Invalid contractor ID' }, { status: 400 });
    }

    if (typeof window !== 'undefined') {
      return Response.json({ error: 'Use from published app only' }, { status: 403 });
    }

    const priceId = Deno.env.get('STRIPE_FEATURED_LISTING_PRICE_ID');
    if (!priceId) {
      console.error('Missing STRIPE_FEATURED_LISTING_PRICE_ID');
      return Response.json({ error: 'Price not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${req.headers.get('origin')}/ContractorAccount?featured=success`,
      cancel_url: `${req.headers.get('origin')}/ContractorAccount?featured=cancel`,
      customer_email: contractorEmail,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        contractor_id: contractorId,
        contractor_email: contractorEmail,
        feature_type: 'featured_listing',
      },
    });

    console.log(`✓ Checkout session created for ${contractorEmail}`);

    return Response.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});