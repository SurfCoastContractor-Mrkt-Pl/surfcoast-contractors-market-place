import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
let stripeClient;

try {
  stripeClient = new Stripe(secretKey);
} catch (error) {
  console.error('Failed to initialize Stripe client');
  stripeClient = null;
}

Deno.serve(async (req) => {
  try {
    if (!stripeClient) {
      return Response.json({ 
        error: 'Payment service unavailable' 
      }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ignore payload email — always use the authenticated user's email
    const userEmail = user.email;

    // Create a setup intent for saving the payment method
    // NOTE: No PII (email) stored in Stripe metadata — user association is tracked internally only
    const setupIntent = await stripeClient.setupIntents.create({
      payment_method_types: ['card'],
      metadata: {
        app_id: Deno.env.get('BASE44_APP_ID'),
      },
      usage: 'off_session',
    });

    return Response.json({
      client_secret: setupIntent.client_secret,
      setup_intent_id: setupIntent.id,
    });
  } catch (error) {
    console.error('Error creating setup intent');
    return Response.json({ 
      error: 'Failed to create setup intent'
    }, { status: error.statusCode || 500 });
  }
});