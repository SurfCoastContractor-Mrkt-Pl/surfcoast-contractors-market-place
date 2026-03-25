import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.19.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const ALLOWED_TRADES = ['plumber', 'hvac', 'electrician', 'concrete', 'drywall', 'painter', 'landscaper'];
const RESIDENTIAL_WAVE_PRICE_ID = Deno.env.get("STRIPE_RESIDENTIAL_WAVE_PRICE_ID");

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contractor profile
    const contractors = await base44.entities.Contractor.filter({ email: user.email });
    
    if (!contractors || contractors.length === 0) {
      return Response.json({ error: 'Contractor profile not found' }, { status: 400 });
    }

    const contractor = contractors[0];
    const tradeSpecialty = contractor.trade_specialty?.toLowerCase() || '';
    const isAllowedTrade = ALLOWED_TRADES.some(trade => tradeSpecialty.includes(trade));

    if (!isAllowedTrade) {
      return Response.json({ 
        error: 'Residential Wave is only available for construction trade contractors (Plumbing, HVAC, Electrical, Concrete, Drywall, Painting, Lawn Services)' 
      }, { status: 403 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: RESIDENTIAL_WAVE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${Deno.env.get('APP_URL')}/ResidentialWaveDashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/ResidentialWaveDashboard`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        contractor_id: contractor.id,
        contractor_email: user.email,
      },
    });

    return Response.json({ 
      checkoutUrl: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});