import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contractorId, contractorEmail } = await req.json();

    if (!contractorId || !contractorEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (user.email.toLowerCase() !== contractorEmail.toLowerCase()) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify contractor profile exists and belongs to this user
    const contractors = await base44.asServiceRole.entities.Contractor.filter({
      email: contractorEmail,
    });

    if (!contractors || contractors.length === 0) {
      return Response.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    const contractorProfile = contractors.find(c => c.id === contractorId);
    if (!contractorProfile) {
      return Response.json({ error: 'Invalid contractor ID' }, { status: 400 });
    }

    // Check if contractor has an active subscription
    const activeSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: contractorEmail,
      status: 'active',
    });

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      return Response.json({ error: 'An active subscription is required to create a featured listing' }, { status: 403 });
    }

    const priceId = Deno.env.get('STRIPE_FEATURED_LISTING_PRICE_ID');
    if (!priceId) {
      console.error('Missing STRIPE_FEATURED_LISTING_PRICE_ID');
      return Response.json({ error: 'Price not configured' }, { status: 500 });
    }

    const origin = req.headers.get('origin') || 'https://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: contractorEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/ContractorAccount?featured=success`,
      cancel_url: `${origin}/ContractorAccount?featured=cancel`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        contractor_id: contractorId,
        contractor_email: contractorEmail,
        feature_type: 'featured_listing',
      },
    });

    console.log(`Featured listing checkout created for ${contractorEmail}`);

    return Response.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Featured listing checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});