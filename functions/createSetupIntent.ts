import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'userEmail required' }, { status: 400 });
    }

    const stripe = await import('npm:stripe@17.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    // Create a setup intent for saving the payment method
    const setupIntent = await stripeClient.setupIntents.create({
      payment_method_types: ['card'],
      metadata: {
        user_email: userEmail,
        app_id: Deno.env.get('BASE44_APP_ID'),
      },
    });

    return Response.json({
      client_secret: setupIntent.client_secret,
      setup_intent_id: setupIntent.id,
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});